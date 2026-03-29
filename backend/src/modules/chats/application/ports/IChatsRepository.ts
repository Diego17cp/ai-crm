import { ChatDTO, GetChatsQueryDTO, PaginatedChatResults } from "../../domain/dtos";

export interface IChatsRepository {
    findChats(query: GetChatsQueryDTO): Promise<PaginatedChatResults<Omit<ChatDTO, "mensajes">>>;
    findChatById(chatId: string): Promise<ChatDTO | null>;
    findChatBySessionId(sessionId: string): Promise<ChatDTO | null>;
}