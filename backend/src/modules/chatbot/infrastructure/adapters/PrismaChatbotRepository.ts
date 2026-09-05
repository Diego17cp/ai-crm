import { Conversaciones, Prisma, PrismaClient } from "generated/prisma/client";
import {
	ChatMessage,
	IChatbotRepository,
} from "../../application/ports/IChatbotRepository";
import { normalizePhone } from "@/core/utils/normalizePhone";
import { ToolAttachment } from "@/core/chat/ToolAttachment";

export class PrismaChatbotRepository implements IChatbotRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getMessagesByConversation(
		conversacionId: string,
	): Promise<ChatMessage[]> {
		const mensajes = await this.prisma.mensajes.findMany({
			where: { id_conversacion: conversacionId },
			orderBy: { created_at: "asc" },
		});

		return mensajes.map((msg) => ({
			id: msg.id,
			remitente: msg.remitente as "HUMANO" | "BOT",
			contenido: msg.contenido || "",
			adjuntos: (msg.adjunto as unknown as ToolAttachment[]) ?? undefined,
			created_at: msg.created_at,
		}));
	}

	async saveMessage(
		conversacionId: string,
		remitente: "HUMANO" | "BOT",
		contenido: string,
		adjuntos?: ToolAttachment[]
	): Promise<void> {
		await this.prisma.$transaction(async (tx) => {
			await tx.mensajes.create({
				data: {
					id_conversacion: conversacionId,
					remitente,
					contenido,
					...(adjuntos && adjuntos.length > 0
						? { adjunto: adjuntos as unknown as Prisma.InputJsonValue }
						: {}
					)
				},
			});
			await tx.eventosConversacion.create({
				data: {
					id_conversacion: conversacionId,
					tipo:
						remitente === "HUMANO"
							? "MENSAJE_RECIBIDO"
							: "BOT_RESPONDE",
				},
			});
			const conversacion = await tx.conversaciones.findUnique({
				where: { id: conversacionId },
				select: {
					fecha_primer_mensaje: true,
					fecha_primera_respuesta_bot: true,
				},
			});
			const dataToUpdate: Prisma.ConversacionesUpdateInput = {};
			if (remitente === "HUMANO" && !conversacion?.fecha_primer_mensaje)
				dataToUpdate.fecha_primer_mensaje = new Date();
			if (
				remitente === "BOT" &&
				!conversacion?.fecha_primera_respuesta_bot
			)
				dataToUpdate.fecha_primera_respuesta_bot = new Date();
			if (Object.keys(dataToUpdate).length > 0) {
				await tx.conversaciones.update({
					where: { id: conversacionId },
					data: dataToUpdate,
				});
			}
		});
	}

	async findActiveConversationBySession(
		sessionId: string,
	): Promise<{ id: string } | null> {
		const conversacion = await this.prisma.conversaciones.findFirst({
			where: {
				session_id: sessionId,
				estado: "BOT",
			},
			select: { id: true },
		});
		return conversacion;
	}

	async findChatById(chatId: string): Promise<Conversaciones | null> {
		const chat = await this.prisma.conversaciones.findFirst({
			where: {
				id: chatId,
			},
			orderBy: { created_at: "desc" },
		});
		return chat;
	}

	async createConversation(
		sessionId: string,
		canal: "WEB" | "WHATSAPP",
	): Promise<{ id: string }> {
		let idPersonaEncontrado: number | null = null;
		if (canal === "WHATSAPP") {
			const numeroNormalizado = normalizePhone(sessionId);
			const telefono = await this.prisma.telefonosPersona.findUnique({
				where: { numero: numeroNormalizado },
				select: { id_persona: true },
			});
			if (telefono) idPersonaEncontrado = telefono.id_persona;
		}
		return this.prisma.$transaction(async (tx) => {
			const nueva = await tx.conversaciones.create({
				data: {
					session_id: sessionId,
					canal: canal,
					estado: "BOT",
					id_persona: idPersonaEncontrado,
				},
				select: { id: true },
			});
			await tx.eventosConversacion.create({
				data: {
					id_conversacion: nueva.id,
					tipo: "INICIADA",
				},
			});
			return nueva;
		});
	}
}
