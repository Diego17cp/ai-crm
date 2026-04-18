import {
	PrismaClient,
	Prisma,
	EstadoLote,
	EstadoCuota,
    TipoPersona,
} from "generated/prisma/client";
import { CuotaWithRelations, ISalesRepository } from "../../application/ports/ISalesRepository";
import {
	GetSalesQueryDTO,
	GetCollectionsQueryDTO,
	PaginatedResult,
} from "../../domain/dtos";

export class PrismaSalesRepository implements ISalesRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findPaginated(query: GetSalesQueryDTO): Promise<PaginatedResult<any>> {
		const {
			page,
			limit,
			estado_venta,
			estado_contrato,
			tipo_pago,
			q,
			fecha_inicio,
			fecha_fin,
		} = query;
		const skip = (page - 1) * limit;

		const where: Prisma.VentasWhereInput = {};
		if (estado_venta) where.estado = estado_venta;
		if (estado_contrato) where.estado_contrato = estado_contrato;
		if (tipo_pago) where.tipo_pago = tipo_pago;

		if (fecha_inicio && fecha_fin) {
			where.fecha_venta = {
				gte: new Date(fecha_inicio),
				lte: new Date(fecha_fin),
			};
		}

		if (q && q.trim() !== "") {
			where.OR = [
				{ cliente: { nombres: { contains: q, mode: "insensitive" } } },
				{
					cliente: {
						apellidos: { contains: q, mode: "insensitive" },
					},
				},
				{ cliente: { numero: { contains: q, mode: "insensitive" } } },
				{
					cliente: {
						telefonos: {
							some: {
								numero: { contains: q, mode: "insensitive" },
							},
						},
					},
				},
				{ lote: { numero_lote: { contains: q, mode: "insensitive" } } },
				{
					lote: {
						manzana: {
							codigo: { contains: q, mode: "insensitive" },
						},
					},
				},
				{
					lote: {
						manzana: {
							etapa: {
								proyecto: {
									nombre: {
										contains: q,
										mode: "insensitive",
									},
								},
							},
						},
					},
				},
			];
		}

		const [total, data] = await Promise.all([
			this.prisma.ventas.count({ where }),
			this.prisma.ventas.findMany({
				where,
				skip,
				take: limit,
				orderBy: { fecha_venta: "desc" },
				include: {
					cliente: {
						select: {
							nombres: true,
							apellidos: true,
							numero: true,
						},
					},
					lote: {
						include: {
							manzana: {
								include: {
									etapa: { include: { proyecto: true } },
								},
							},
						},
					},
					_count: {
						select: {
							cuotas: {
								where: { estado: EstadoCuota.PENDIENTE },
							},
						},
					},
				},
			}),
		]);

        const totalPages = Math.ceil(total / limit);

		return {
			data,
			meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
		};
	}

	async findById(id: number): Promise<any | null> {
		return this.prisma.ventas.findUnique({
			where: { id },
			include: {
				cliente: true,
				lote: {
					include: {
						manzana: {
							include: { etapa: { include: { proyecto: true } } },
						},
					},
				},
				cuotas: { orderBy: { numero_cuota: "asc" } },
			},
		});
	}

	async createSaleWithQuotas(
		createPayload: Prisma.VentasCreateInput,
		cuotas: Prisma.CuotasCreateManyVentaInput[],
		loteId: number,
        clienteId: number,
	) {
		return this.prisma.$transaction(async (tx) => {
			const res = await tx.lotes.updateMany({
				where: { id: loteId, estado: { not: EstadoLote.Vendido } },
				data: { estado: EstadoLote.Vendido },
			});
			if (res.count === 0) throw new Error("RACE_CONDITION: El lote ya fue reservado o vendido por otra transacción simultánea.");
            await tx.clientes.update({
                where: { id: clienteId },
                data: { tipo_persona: TipoPersona.CLIENTE }
            })
			return tx.ventas.create({
				data: {
					...createPayload,
					cuotas: {
						createMany: { data: cuotas },
					},
				},
			});
		});
	}

	async payQuota(cuotaId: number, data: Prisma.CuotasUpdateInput) {
		return this.prisma.cuotas.update({
			where: { id: cuotaId },
			data,
		});
	}

	async findCollections(
		query: GetCollectionsQueryDTO,
	): Promise<PaginatedResult<any>> {
		const { page, limit, filtro, dias_proximas } = query;
		const skip = (page - 1) * limit;
		const hoy = new Date();

		const where: Prisma.CuotasWhereInput = {
			estado: EstadoCuota.PENDIENTE,
		};

		if (filtro === "vencidas") where.fecha_vencimiento = { lt: hoy };
		else if (filtro === "proximas") {
			const futuro = new Date();
			futuro.setDate(hoy.getDate() + (dias_proximas || 7));
			where.fecha_vencimiento = { gte: hoy, lte: futuro };
		}

		const [total, data] = await Promise.all([
			this.prisma.cuotas.count({ where }),
			this.prisma.cuotas.findMany({
				where,
				skip,
				take: limit,
				orderBy: { fecha_vencimiento: "asc" },
				include: {
					venta: {
						include: {
							lote: {
								include: {
									manzana: {
										include: {
											etapa: {
												include: { proyecto: true },
											},
										},
									},
								},
							},
							cliente: { include: { telefonos: true } },
						},
					},
				},
			}),
		]);

        const totalPages = Math.ceil(total / limit);

		return {
			data,
			meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
		};
	}
	async getOverdueQuotas(): Promise<CuotaWithRelations[]> {
		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparar solo fechas
		const todayEnd = new Date(todayStart);
		todayEnd.setDate(todayEnd.getDate() + 1); // Siguiente día a medianoche

		const reminderStart = new Date(todayStart);
		reminderStart.setDate(reminderStart.getDate() + 5);
		const reminderEnd = new Date(reminderStart);
		reminderEnd.setDate(reminderEnd.getDate() + 1);

		return this.prisma.cuotas.findMany({
			where: {
				estado: EstadoCuota.PENDIENTE,
				OR: [
					{ fecha_vencimiento: { lt: todayStart } }, // Vencidas
					{ fecha_vencimiento: { gte: todayStart, lt: todayEnd } }, // Vencen hoy
					{ fecha_vencimiento: { gte: reminderStart, lt: reminderEnd } }, // Próximas a vencer en 5 días
				]
			},
			include: {
				venta: {
					include: {
						cliente: { include: { telefonos: true } },
						lote: {
							include: {
								manzana: {
									include: {
										etapa: {
											include: { proyecto: true },
										}
									}
								}
							}
						}
					}
				}
			}
		});
	}
	async findCuotaById(id: number): Promise<CuotaWithRelations | null> {
		return this.prisma.cuotas.findUnique({
			where: { id },
			include: {
				venta: {
					include: {
						cliente: { include: { telefonos: true } },
						lote: {
							include: {
								manzana: {
									include: {
										etapa: {
											include: { proyecto: true },
										}
									}
								}
							}
						}
					}
				}
			}
		});
	}
}
