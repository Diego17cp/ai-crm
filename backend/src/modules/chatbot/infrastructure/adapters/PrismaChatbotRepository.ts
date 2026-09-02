import { Conversaciones, PrismaClient } from "generated/prisma/client";
import {
	ChatMessage,
	IChatbotRepository,
} from "../../application/ports/IChatbotRepository";

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
			created_at: msg.created_at,
		}));
	}

	async saveMessage(
		conversacionId: string,
		remitente: "HUMANO" | "BOT",
		contenido: string,
	): Promise<void> {
		await this.prisma.mensajes.create({
			data: {
				id_conversacion: conversacionId,
				remitente,
				contenido,
			},
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
			const personaRelacion =
				await this.prisma.telefonosPersona.findFirst({
					where: {
						numero: { endsWith: sessionId.slice(-9) },
					},
					select: { id_persona: true },
				});
			if (personaRelacion)
				idPersonaEncontrado = personaRelacion.id_persona;
		}
		if (!idPersonaEncontrado) {
			const anon = await this.prisma.personas.create({
				data: {
					id_tipo_doc: 1,
					numero: `AN-${Date.now().toString().slice(-8)}`,
					nombres: canal === "WHATSAPP" ? sessionId : "Anónimo",
				},
			});
			idPersonaEncontrado = anon.id;
		}

		const nueva = await this.prisma.conversaciones.create({
			data: {
				session_id: sessionId,
				canal: canal,
				estado: "BOT",
				id_persona: idPersonaEncontrado,
			},
			select: { id: true },
		});
		return nueva;
	}
}
