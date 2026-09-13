import { IQuotePdfService } from "@/core/pdf/IQuotePdfService";
import { IQuoteRepository } from "../ports/IQuoteRepository";
import { IDocumentDeliveryService } from "@/core/documents/IDocumentDeliveryService";
import { IChatbotRepository } from "@/modules/chatbot/application/ports/IChatbotRepository";
import { MetricsService } from "@/core/crm/MetricsService";
import { IEventNotifier } from "@/modules/chatbot/application/ports/IEventNotifier";
import { AppError } from "@/core/errors/AppError";
import { saveQuotePdf } from "@/infrastructure/pdf/savePdf";
import { PrismaClient } from "generated/prisma/client";
import {
	CreateManualQuoteDTO,
	GetQuotesQueryDTO,
	QuoteDetailDTO,
} from "../../domain/dtos";
import { IdentityResolverService } from "@/core/identity/IdentityResolverService";
import { IWhatsappService } from "@/modules/chatbot/application/ports/IWhatsappService";
import { COTIZACION_THRESHOLDS } from "@/core/crm/quote-thresholds";

export class QuoteUseCases {
	constructor(
		private prisma: PrismaClient,
		private repo: IQuoteRepository,
		private quotePdfService: IQuotePdfService,
		private documentDelivery: IDocumentDeliveryService,
		private chatbotRepo: IChatbotRepository,
		private metrics: MetricsService,
		private notifier: IEventNotifier,
		private identityResolver: IdentityResolverService,
		private whatsappService: IWhatsappService,
	) {}

	async takeReview(quoteId: number, asesorId: string) {
		const claimed = await this.repo.claimReview(quoteId, asesorId);
		if (!claimed)
			throw new AppError(
				"Esta cotización ya fue tomada por otro asesor o ya no está pendiente.",
				409,
			);
	}
	async approveReview(quoteId: number, asesorId: string) {
		const cotizacion = await this.repo.findByIdWithRelations(quoteId);
		if (!cotizacion) throw new AppError("Cotización no encontrada", 404);
		if (cotizacion.id_revisor !== asesorId)
			throw new AppError(
				"No tienes esta revisión asignada. Debes tomarla primero.",
				403,
			);
		const proyecto = cotizacion.lote.manzana.etapa.proyecto;
		const pdfBuffer = await this.quotePdfService.generate({
			codigo: cotizacion.codigo,
			clienteNombre:
				`${cotizacion.persona.nombres ?? ""} ${cotizacion.persona.apellidos ?? ""}`.trim() ||
				"Cliente",
			proyectoNombre: proyecto.nombre,
			loteIdentificador: `${cotizacion.lote.manzana.codigo}-${cotizacion.lote.numero_lote.replace(/^LT-/i, "")}`,
			areaM2: Number(cotizacion.area_m2),
			precioLista: Number(cotizacion.precio_lista),
			descuentoPorcentaje: Number(cotizacion.descuento),
			precioFinal: Number(cotizacion.precio_final),
			tipoPago: cotizacion.numero_cuotas ? "CREDITO" : "CONTADO",
			cuotaInicial: cotizacion.cuota_inicial
				? Number(cotizacion.cuota_inicial)
				: undefined,
			numeroCuotas: cotizacion.numero_cuotas ?? undefined,
			montoCuota: cotizacion.monto_cuota
				? Number(cotizacion.monto_cuota)
				: undefined,
		});
		const pdfUrl = saveQuotePdf(pdfBuffer, cotizacion.codigo);

		const aprobado = await this.prisma.$transaction(async (tx) => {
			const ok = await this.repo.markApproved(
				tx,
				quoteId,
				asesorId,
				pdfUrl,
			);
			if (!ok) return false;
			await this.metrics.incrementCotizacionGenerada(asesorId, tx);
			return true;
		});

		if (!aprobado)
			throw new AppError(
				"La cotización ya no estaba disponible para aprobar.",
				409,
			);

		if (!cotizacion.id_conversacion) return;

		const resultado = await this.documentDelivery.deliver({
			conversationId: cotizacion.id_conversacion,
			title: `Cotización ${cotizacion.codigo}`,
			url: pdfUrl,
			filename: `Cotizacion_${cotizacion.codigo}.pdf`,
			whatsappTemplateName: "envio_cotizacion",
			whatsappTemplateParams: [proyecto.nombre],
		});

		if (!resultado.deliveredByWhatsapp && resultado.attachment) {
			const mensaje = `¡Buenas noticias! Tu cotización (código ${cotizacion.codigo}) fue revisada y aprobada. Aquí la tienes:`;
			await this.chatbotRepo.saveMessage(
				cotizacion.id_conversacion,
				"BOT",
				mensaje,
				[resultado.attachment],
			);
			this.notifier.notifyQuoteApprovedForClient(
				cotizacion.id_conversacion,
				mensaje,
				resultado.attachment,
			);
		}
	}
	async rejectReview(quoteId: number, asesorId: string, motivo?: string) {
		const cotizacion = await this.repo.findByIdWithRelations(quoteId);
		if (!cotizacion) throw new AppError("Cotización no encontrada", 404);
		if (cotizacion.id_revisor !== asesorId)
			throw new AppError(
				"No tienes esta revisión asignada. Debes tomarla primero.",
				403,
			);

		const rechazado = await this.prisma.$transaction(async (tx) => {
			const ok = await this.repo.markRejected(
				tx,
				quoteId,
				asesorId,
				motivo,
			);
			if (!ok) return false;
			return true;
		});
		if (!rechazado)
			throw new AppError(
				"La cotización ya no estaba disponible para rechazar.",
				409,
			);

		if (cotizacion.id_conversacion) {
			const mensaje = motivo 
				? `Gracias por tu paciencia. Uno de nuestros asesores revisó tu solicitud y nos indicó lo siguiente: "${motivo}". Se pondrá en contacto contigo directamente para conversar sobre las condiciones de tu cotización. 🙂`
				: "Gracias por tu paciencia. Uno de nuestros asesores revisó tu solicitud y se pondrá en contacto contigo directamente para conversar sobre las condiciones de tu cotización. 🙂";
			await this.chatbotRepo.saveMessage(
				cotizacion.id_conversacion,
				"BOT",
				mensaje,
			);
			this.notifier.notifyQuoteApprovedForClient(
				cotizacion.id_conversacion,
				mensaje,
			);
		}
	}
	async getPendingQueue() {
		return this.repo.findPendingQueue();
	}
	async getMyReviews(idUsuario: string) {
		if (!idUsuario) throw new AppError("ID de usuario es requerido", 400);
		return this.repo.findMyReviews(idUsuario);
	}
	async getQuoteById(quoteId: number): Promise<QuoteDetailDTO> {
		if (isNaN(quoteId) || quoteId <= 0)
			throw new AppError("ID de cotización inválido", 400);
		const quote = await this.repo.findByIdWithRelations(quoteId);
		if (!quote) throw new AppError("Cotización no encontrada", 404);
		return {
			id: quote.id,
			codigo: quote.codigo,
			cliente:
				`${quote.persona.nombres ?? ""} ${quote.persona.apellidos ?? ""}`.trim() ||
				"Cliente anónimo",
			proyecto: quote.lote.manzana.etapa.proyecto.nombre,
			lote: `${quote.lote.manzana.codigo}-${quote.lote.numero_lote.replace(/^LT-/i, "")}`,
			area_m2: Number(quote.area_m2),
			precio_lista: Number(quote.precio_lista),
			descuento: Number(quote.descuento),
			precio_final: Number(quote.precio_final),
			cuota_inicial: quote.cuota_inicial
				? Number(quote.cuota_inicial)
				: undefined,
			numero_cuotas: quote.numero_cuotas ?? undefined,
			monto_cuota: quote.monto_cuota
				? Number(quote.monto_cuota)
				: undefined,
			motivo_revision: quote.motivo_revision ?? "",
			estado: quote.estado,
			requiere_revision: quote.requiere_revision,
			id_revisor: quote.id_revisor,
			revisor: quote.revisor
				? {
						nombres: quote.revisor.nombres,
						apellidos: quote.revisor.apellidos,
					}
				: null,
			asesor: quote.asesor
				? {
						nombres: quote.asesor.nombres,
						apellidos: quote.asesor.apellidos,
					}
				: null,
			pdf_url: quote.pdf_url,
			generado_por: quote.generado_por,
			created_at: quote.created_at,
		};
	}
	async getQuotes(query: GetQuotesQueryDTO) {
		return this.repo.findQuotes(query);
	}
	async createManualQuote(
		data: CreateManualQuoteDTO,
		idAsesor: string,
	): Promise<{ quote: QuoteDetailDTO; deliveredByWhatsapp: boolean }> {
		const lote = await this.prisma.lotes.findUnique({
			where: { id: data.id_lote },
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
		});

		if (!lote) throw new AppError("Lote no encontrado", 404);
		if (lote.estado !== "Disponible")
			throw new AppError("Lote no disponible", 400);

		const persona = await this.identityResolver.resolveIdentity({
			id_tipo_doc: data.id_tipo_doc,
			numero: data.documento_identidad,
			nombres: data.nombres ?? null,
			apellidos: data.apellidos ?? null,
			email: data.email ?? null,
			telefonos: data.telefono
				? [{ numero: data.telefono, tipo: "PERSONAL" }]
				: [],
		});

		const precioLista = Number(lote.precio_total);
		const descuentoOficial = Number(
			lote.manzana.etapa.proyecto.porcentaje_descuento ?? 0,
		);

		let descuentoAplicado = 0;
		let cuotaInicial: number | undefined;
		let numeroCuotas: number | undefined;
		let montoCuota: number | undefined;
		let precioFinal = precioLista;

		if (data.tipo_pago === "CONTADO") {
			descuentoAplicado = data.descuento_solicitado ?? descuentoOficial;
			precioFinal = precioLista * (1 - descuentoAplicado / 100);
		} else {
			if (!data.meses)
				throw new AppError(
					"Falta el plazo en meses para cotizar a crédito",
					400,
				);
			numeroCuotas = data.meses;
			cuotaInicial =
				data.cuota_inicial_deseada ??
				precioLista *
					COTIZACION_THRESHOLDS.CUOTA_INICIAL_MIN_PORCENTAJE;
			montoCuota = (precioLista - cuotaInicial) / numeroCuotas;
			precioFinal = precioLista;
		}

		const codigo = `COT-${lote.manzana.etapa.proyecto.abreviatura ?? "GEN"}-${Date.now().toString().slice(-6)}`;

		const cotizacion = await this.prisma.cotizaciones.create({
			data: {
				codigo,
				id_persona: persona.id,
				id_lead: data.id_lead ?? null,
				id_lote: lote.id,
				id_conversacion: null,
				id_asesor: idAsesor,
				generado_por: "ASESOR",
				requiere_revision: false,
				area_m2: lote.area_m2,
				precio_m2: lote.precio_m2,
				precio_lista: precioLista,
				descuento: descuentoAplicado,
				precio_final: precioFinal,
				...(cuotaInicial !== undefined && {
					cuota_inicial: cuotaInicial,
				}),
				...(numeroCuotas !== undefined && {
					numero_cuotas: numeroCuotas,
				}),
				...(montoCuota !== undefined && { monto_cuota: montoCuota }),
				estado: "EMITIDA",
			},
		});
		const pdfBuffer = await this.quotePdfService.generate({
			codigo,
			clienteNombre:
				`${persona.nombres ?? ""} ${persona.apellidos ?? ""}`.trim() ||
				"Cliente",
			proyectoNombre: lote.manzana.etapa.proyecto.nombre,
			loteIdentificador: `${lote.manzana.codigo}-${lote.numero_lote.replace(/^LT-/i, "")}`,
			areaM2: Number(lote.area_m2),
			precioLista,
			descuentoPorcentaje: descuentoAplicado,
			precioFinal,
			tipoPago: data.tipo_pago,
			cuotaInicial,
			numeroCuotas,
			montoCuota,
		});
		const pdfUrl = saveQuotePdf(pdfBuffer, codigo);
		let entregadaPorWhatsapp = false;
		if (data.telefono && this.whatsappService.sendDocumentTemplate) {
			try {
				await this.whatsappService.sendDocumentTemplate.call(
					this.whatsappService,
					data.telefono,
					"envio_cotizacion",
					pdfUrl,
					`Cotizacion_${codigo}.pdf`,
					[lote.manzana.etapa.proyecto.nombre],
				);
				entregadaPorWhatsapp = true;
			} catch (e) {
				console.error(
					"[QuoteUseCases] Error al enviar cotización manual por WhatsApp:",
					e,
				);
			}
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.cotizaciones.update({
				where: { id: cotizacion.id },
				data: { pdf_url: pdfUrl },
			});
			await this.metrics.incrementCotizacionGenerada(idAsesor, tx);
		});

		const quote = await this.getQuoteById(cotizacion.id);
		return { quote, deliveredByWhatsapp: entregadaPorWhatsapp };
	}
}
