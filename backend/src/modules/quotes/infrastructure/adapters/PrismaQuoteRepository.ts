import { Prisma, PrismaClient } from "generated/prisma/client";
import { IQuoteRepository } from "../../application/ports/IQuoteRepository";
import { GetQuotesQueryDTO, PaginatedResult, QuoteDTO, QuoteQueueItemDTO, QuoteWithRelations } from "../../domain/dtos";
import { CotizacionesWhereInput } from "generated/prisma/models";

export class PrismaQuoteRepository implements IQuoteRepository {
	constructor(private prisma: PrismaClient) {}

	async claimReview(quoteId: number, asesorId: string): Promise<boolean> {
		const res = await this.prisma.cotizaciones.updateMany({
			where: {
				id: quoteId,
				id_revisor: null,
				requiere_revision: true,
				estado: "BORRADOR",
			},
			data: { id_revisor: asesorId },
		});
		return res.count > 0;
	}

	async findByIdWithRelations(
		quoteId: number,
	): Promise<QuoteWithRelations | null> {
		return this.prisma.cotizaciones.findUnique({
			where: { id: quoteId },
			include: {
				persona: true,
				revisor: true,
				asesor: true,
				lote: {
					include: {
						manzana: {
							include: { etapa: { include: { proyecto: true } } },
						},
					},
				},
			},
		});
	}

	async markApproved(
		tx: Prisma.TransactionClient,
		quoteId: number,
		asesorId: string,
		pdfUrl: string,
	): Promise<boolean> {
		const res = await tx.cotizaciones.updateMany({
			where: {
				id: quoteId,
				id_revisor: asesorId,
				estado: "BORRADOR",
			},
			data: {
				estado: "EMITIDA",
				fecha_revision: new Date(),
				pdf_url: pdfUrl,
			},
		});
		return res.count > 0;
	}

	async markRejected(
		tx: Prisma.TransactionClient,
		quoteId: number,
		asesorId: string,
		motivoRechazo?: string,
	): Promise<boolean> {
		const res = await tx.cotizaciones.updateMany({
			where: {
				id: quoteId,
				id_revisor: asesorId,
				estado: "BORRADOR",
			},
			data: {
				estado: "RECHAZADA",
				motivo_rechazo: motivoRechazo ?? null,
			},
		});
		return res.count > 0;
	}

	async findPendingQueue(): Promise<QuoteQueueItemDTO[]> {
		const cotizaciones = await this.prisma.cotizaciones.findMany({
			where: {
				requiere_revision: true,
				estado: "BORRADOR",
				id_revisor: null,
			},
			orderBy: { created_at: "asc" },
			include: {
				persona: {
					select: {
						nombres: true,
						apellidos: true,
					},
				},
				lote: {
					include: {
						manzana: {
							include: {
								etapa: {
									include: {
										proyecto: true,
									},
								},
							},
						},
					},
				},
			},
		});
		return cotizaciones.map(this.toQueueItemDTO);
	}

	async findMyReviews(idUsuario: string): Promise<QuoteQueueItemDTO[]> {
		const cotizaciones = await this.prisma.cotizaciones.findMany({
			where: {
				requiere_revision: true,
				estado: "BORRADOR",
				id_revisor: idUsuario,
			},
			orderBy: { created_at: "desc" },
			include: {
				persona: {
					select: {
						nombres: true,
						apellidos: true,
					},
				},
				lote: {
					include: {
						manzana: {
							include: {
								etapa: {
									include: {
										proyecto: true,
									},
								},
							},
						},
					},
				},
			},
		});
		return cotizaciones.map(this.toQueueItemDTO);
	}

	private toQueueItemDTO(
		cotizacion: Prisma.CotizacionesGetPayload<{
			include: {
				persona: {
					select: {
						nombres: true;
						apellidos: true;
					};
				};
				lote: {
					include: {
						manzana: {
							include: {
								etapa: {
									include: {
										proyecto: true;
									};
								};
							};
						};
					};
				};
			};
		}>,
	): QuoteQueueItemDTO {
		return {
			id: cotizacion.id,
			codigo: cotizacion.codigo,
			cliente: `${cotizacion.persona.nombres} ${cotizacion.persona.apellidos}`,
			proyecto: cotizacion.lote.manzana.etapa.proyecto.nombre,
			lote: `${cotizacion.lote.manzana.codigo}-${cotizacion.lote.numero_lote.replace(/^LT-/i, "")}`,
			precio_final: Number(cotizacion.precio_final),
			motivo_revision: "",
			createdAt: cotizacion.created_at.toISOString(),
		};
	}

	async findQuotes(query: GetQuotesQueryDTO): Promise<PaginatedResult<QuoteDTO>> {
		const { q, estado, generado_por, id_usuario, page, limit } = query;
		const skip = (page - 1) * limit
		const whereCondition: CotizacionesWhereInput = {}
		if (q) {
			whereCondition.OR = [
				{ codigo: { contains: q, mode: "insensitive" } },
				{ persona: { nombres: { contains: q, mode: "insensitive" } } },
				{ persona: { apellidos: { contains: q, mode: "insensitive" } } },
				{ asesor: { nombres: { contains: q, mode: "insensitive" } } },
				{ asesor: { apellidos: { contains: q, mode: "insensitive" } } },
				{ revisor: { nombres: { contains: q, mode: "insensitive" } } },
				{ revisor: { apellidos: { contains: q, mode: "insensitive" } } },
				{ lote: { manzana: { etapa: { proyecto: { nombre: { contains: q, mode: "insensitive" } } } } } },
				{ lote: { manzana: { codigo: { contains: q, mode: "insensitive" } } } },
				{ lote: { numero_lote: { contains: q, mode: "insensitive" } } },
			];
		}
		if (estado) whereCondition.estado = estado;
		if (generado_por) whereCondition.generado_por = generado_por;
		if (id_usuario) {
        whereCondition.OR = [
            ...(whereCondition.OR || []),
            { id_asesor: id_usuario },
            { id_revisor: id_usuario }
        ];
    }
		
		const [total, cotizaciones] = await Promise.all([
			this.prisma.cotizaciones.count({ where: whereCondition }),
			this.prisma.cotizaciones.findMany({
				where: whereCondition,
				skip,
				take: limit,
				orderBy: { updated_at: "desc" },
				include: {
					persona: {
						select: {
							id: true,
							nombres: true,
							apellidos: true
						}
					},
					asesor: {
						select: {
							id: true,
							nombres: true,
							apellidos: true,
						}
					},
					revisor: {
						select: {
							id: true,
							nombres: true,
							apellidos: true,
						}
					},
					lote: {
						include: {
							manzana: {
								include: {
									etapa: {
										include: {
											proyecto: true
										}
									}
								}
							}
						}
					}
				}
			})
		])
		const totalPages = Math.ceil(total / limit)
		const data = cotizaciones.map(cot => ({
			id: cot.id,
			codigo: cot.codigo,
			cliente: {
				id: cot.persona.id,
				nombres: cot.persona.nombres,
				apellidos: cot.persona.apellidos,
			},
			asesor: cot.asesor ? {
				id: cot.asesor.id,
				nombres: cot.asesor.nombres,
				apellidos: cot.asesor.apellidos,
			} : null,
			revisor: cot.revisor ? {
				id: cot.revisor.id,
				nombres: cot.revisor.nombres,
				apellidos: cot.revisor.apellidos,
			} : null,
			precio_final: Number(cot.precio_final),
			created_at: cot.created_at,
			estado: cot.estado,
			generado_por: cot.generado_por,
		}))
		return {
			data,
			meta: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			}
		}
	}
}
