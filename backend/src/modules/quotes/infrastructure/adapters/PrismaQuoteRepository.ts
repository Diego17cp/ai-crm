import { Prisma, PrismaClient } from "generated/prisma/client";
import { IQuoteRepository } from "../../application/ports/IQuoteRepository";
import { QuoteQueueItemDTO, QuoteWithRelations } from "../../domain/dtos";

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
}
