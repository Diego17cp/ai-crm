import { AppError } from "@/core/errors/AppError";
import { GetChatsQueryDTO } from "../../domain/dtos";
import { IChatsRepository } from "../ports/IChatsRepository";

export class ChatUseCases {
    constructor(
        private chatsRepository: IChatsRepository
    ) {}
    async getChats(query: GetChatsQueryDTO) {
        return this.chatsRepository.findChats(query);
    }
    async getChatById(chatId: string) {
        if (!chatId || chatId.trim() === "") throw new AppError("ID de chat es requerido", 400);
        const chat = await this.chatsRepository.findChatById(chatId);
        if (!chat)throw new AppError("Chat no encontrado", 404);
        return chat;
    }
    async getChatBySessionId(sessionId: string) {
        if (!sessionId || sessionId.trim() === "") throw new AppError("ID de sesión es requerido", 400);
        const chat = await this.chatsRepository.findChatBySessionId(sessionId);
        if (!chat)  throw new AppError("Chat no encontrado para la sesión proporcionada", 404);
        return chat;
    }
}