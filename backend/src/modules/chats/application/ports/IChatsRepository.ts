import { EstadoChat } from "generated/prisma/enums";
import {
	ChatDTO,
	GetChatsQueryDTO,
	LiveChatQueueItemDTO,
	PaginatedChatResults,
} from "../../domain/dtos";

export interface IChatsRepository {
	findChats(
		query: GetChatsQueryDTO,
	): Promise<PaginatedChatResults<Omit<ChatDTO, "mensajes">>>;
	findChatById(chatId: string): Promise<ChatDTO | null>;
	findChatBySessionId(sessionId: string): Promise<ChatDTO | null>;
	findLiveChatQueue(): Promise<LiveChatQueueItemDTO[]>;
	findLiveActiveChats(idUsuario: string): Promise<LiveChatQueueItemDTO[]>;
	takeChatFromQueue(chatId: string, asesorId: string): Promise<any>;
	saveMessage(chatId: string, content: string, senderRole: "CLIENTE" | "ASESOR" | "BOT"): Promise<any>;
	updateChatStatus(chatId: string, newStatus: EstadoChat): Promise<void>;
}
