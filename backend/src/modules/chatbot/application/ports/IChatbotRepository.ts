import { ToolAttachment } from "@/core/chat/ToolAttachment";
import { Conversaciones } from "generated/prisma/client";

export interface ChatMessage {
	id?: number;
	remitente: "HUMANO" | "BOT";
	contenido: string;
	id_usuario?: string | null;
	adjuntos?: ToolAttachment[];
	created_at?: Date;
}
export interface ConversationLookup {
	id: string;
	estado: "BOT" | "ESPERANDO_ASESOR" | "ATENDIDO_HUMANO" | "FINALIZADO";
}

export interface IChatbotRepository {
	getMessagesByConversation(conversacionId: string): Promise<ChatMessage[]>;
	saveMessage(
		conversacionId: string,
		remitente: "HUMANO" | "BOT",
		contenido: string,
		adjuntos?: ToolAttachment[],
	): Promise<void>;
	findConversationBySession(
		sessionId: string,
	): Promise<ConversationLookup | null>;
	findChatById(chatId: string): Promise<Conversaciones | null>;
	createConversation(
		sessionId: string,
		canal: "WEB" | "WHATSAPP",
	): Promise<{ id: string }>;
	reactivateConversation(conversacionId: string): Promise<void>;
	findLastMessage(conversacionId: string): Promise<ChatMessage | null>;
}
