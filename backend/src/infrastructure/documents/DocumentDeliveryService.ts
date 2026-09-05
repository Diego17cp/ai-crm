import { PrismaClient } from "generated/prisma/client";
import { IWhatsappService } from "@/modules/chatbot/application/ports/IWhatsappService";
import {
	IDocumentDeliveryService,
	DeliverDocumentInput,
	DeliverDocumentResult,
} from "@/core/documents/IDocumentDeliveryService";

export class DocumentDeliveryService implements IDocumentDeliveryService {
	constructor(
		private prisma: PrismaClient,
		private whatsappService: IWhatsappService,
	) {}

	async deliver(input: DeliverDocumentInput): Promise<DeliverDocumentResult> {
		const conversacion = await this.prisma.conversaciones.findUnique({
			where: { id: input.conversationId },
			select: {
				canal: true,
				session_id: true,
				persona: {
					select: {
						telefonos: { select: { numero: true }, take: 1 },
					},
				},
			},
		});

		if (!conversacion) {
			return {
				deliveredByWhatsapp: false,
				error: "No se encontró la conversación para enviar el documento.",
			};
		}

		if (conversacion.canal !== "WHATSAPP") {
			return {
				deliveredByWhatsapp: false,
				attachment: {
					type: "document",
					title: input.title,
					url: input.url,
					filename: input.filename,
					available_preview: true,
				},
			};
		}

		// Canal WHATSAPP
		const telefono =
			conversacion.session_id ||
			conversacion.persona?.telefonos[0]?.numero;
		if (!telefono) {
			return {
				deliveredByWhatsapp: false,
				error: "No se encontró un número de teléfono asociado a la conversación.",
			};
		}

		if (!this.whatsappService.sendDocumentTemplate) {
			console.warn(
				"[DocumentDelivery] whatsappService.sendDocumentTemplate no implementado",
			);
			return {
				deliveredByWhatsapp: false,
				error: "El servicio de WhatsApp no soporta documentos template.",
			};
		}

		try {
			await this.whatsappService.sendDocumentTemplate.call(
				this.whatsappService,
				telefono,
				input.whatsappTemplateName,
				input.url,
				input.filename,
				input.whatsappTemplateParams,
			);
			return { deliveredByWhatsapp: true };
		} catch (e) {
			console.error("[DocumentDelivery] Error al enviar documento:", e);
			return {
				deliveredByWhatsapp: false,
				error: "Hubo un error técnico al intentar enviar el documento.",
			};
		}
	}
}
