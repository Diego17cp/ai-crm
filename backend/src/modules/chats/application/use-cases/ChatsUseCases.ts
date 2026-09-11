import { AppError } from "@/core/errors/AppError";
import { GetChatsQueryDTO } from "../../domain/dtos";
import { IChatsRepository } from "../ports/IChatsRepository";
import { EstadoChat } from "generated/prisma/enums";
import { LeadTransitionService } from "@/core/crm/LeadTransitionService";
import { PrismaClient } from "generated/prisma/client";
import { MetricsService } from "@/core/crm/MetricsService";

export class ChatUseCases {
	private readonly metricsService: MetricsService
	constructor(
		private chatsRepository: IChatsRepository,
		private leadTransitionService: LeadTransitionService,
		private prisma: PrismaClient,
	) {
		this.metricsService = new MetricsService()
	}
	async getChats(query: GetChatsQueryDTO) {
		return this.chatsRepository.findChats(query);
	}
	async getChatById(chatId: string) {
		if (!chatId || chatId.trim() === "")
			throw new AppError("ID de chat es requerido", 400);
		const chat = await this.chatsRepository.findChatById(chatId);
		if (!chat) throw new AppError("Chat no encontrado", 404);
		return chat;
	}
	async getChatBySessionId(sessionId: string) {
		if (!sessionId || sessionId.trim() === "")
			throw new AppError("ID de sesión es requerido", 400);
		const chat = await this.chatsRepository.findChatBySessionId(sessionId);
		if (!chat)
			throw new AppError(
				"Chat no encontrado para la sesión proporcionada",
				404,
			);
		return chat;
	}
	async getLiveChatQueue() {
		return this.chatsRepository.findLiveChatQueue();
	}
	async getLiveActiveChats(idUsuario: string) {
		if (!idUsuario || idUsuario.trim() === "")
			throw new AppError("ID de usuario es requerido", 400);
		return this.chatsRepository.findLiveActiveChats(idUsuario);
	}
	async assignChatFromQueue(chatId: string, asesorId: string) {
		if (!chatId || chatId.trim() === "")
			throw new AppError("ID de chat es requerido", 400);
		if (!asesorId || asesorId.trim() === "")
			throw new AppError("ID de asesor es requerido", 400);
		try {
			const chat = await this.chatsRepository.takeChatFromQueue(
				chatId,
				asesorId,
			);
			return chat;
		} catch (error: any) {
			if (error.message.includes("[RACE_CONDITION]"))
				throw new AppError(
					"No se pudo tomar el chat. Es posible que ya haya sido tomado por otro asesor.",
					409,
				);
			throw error;
		}
	}
	async saveLiveChatMessage(
		chatId: string,
		content: string,
		senderRole: "CLIENTE" | "ASESOR" | "BOT",
	) {
		if (!chatId || chatId.trim() === "")
			throw new AppError("ID de chat es requerido", 400);
		if (!content || content.trim() === "")
			throw new AppError(
				"El contenido del mensaje no puede estar vacío",
				400,
			);
		try {
			const message = await this.chatsRepository.saveMessage(
				chatId,
				content,
				senderRole,
			);
			if (senderRole === "ASESOR") { 
				await this.tryTransitionToContacted(chatId)
				const lastClientMessage = await this.chatsRepository.findLastClientMessageTime(chatId)
				if (lastClientMessage) {
					const chat = await this.chatsRepository.findChatById(chatId)
					if (chat?.asesor?.id) {
						const seconds = Math.round((Date.now() - lastClientMessage.getTime()) / 1000)
						await this.prisma.$transaction((tx) => this.metricsService.incrementTiempoRespuesta(chat.asesor?.id!, seconds, tx))
					}
				}
			}
			return message;
		} catch (error: any) {
			throw new AppError(
				"Error al guardar el mensaje en vivo: " + error.message,
				500,
			);
		}
	}
	private async tryTransitionToContacted(chatId: string) {
		const chat = await this.chatsRepository.findChatById(chatId)
		if (!chat?.lead?.id) return
		const lead = await this.prisma.leads.findUnique({
			where: { id: chat.lead.id },
			select: { estado: true }
		})
		if (lead?.estado !== "NUEVO") return
		await this.prisma.$transaction(tx => 
			this.leadTransitionService.transition({
				leadId: chat.lead?.id!,
				nuevoEstado: "CONTACTADO",
				idUsuario: chat.asesor?.id ?? undefined,
				motivo: "Primer mensaje del asesor en el chat en vivo",
				tx
			})
		)
	}
	async updateChatStatus(
		chatId: string,
		newStatus: EstadoChat,
		userId?: string,
	) {
		if (!chatId || chatId.trim() === "")
			throw new AppError("ID de chat es requerido", 400);
		try {
			await this.chatsRepository.updateChatStatus(
				chatId,
				newStatus,
				userId,
			);
		} catch (error: any) {
			throw new AppError(
				"Error al actualizar el estado del chat: " + error.message,
				500,
			);
		}
	}
	async getEventsByChatId(chatId: string) {
		if (!chatId || chatId.trim() === "")
			throw new AppError("ID de chat es requerido", 400);
		return this.chatsRepository.findEventsByChatId(chatId);
	}

	async getAssignmentsByChatId(chatId: string) {
		if (!chatId || chatId.trim() === "")
			throw new AppError("ID de chat es requerido", 400);
		return this.chatsRepository.findAssignmentsByChatId(chatId);
	}
}
