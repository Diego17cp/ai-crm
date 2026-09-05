import { apiClient } from "@/core/api";
import { getOrCreateChatIdentifier } from "../utils/chatSession"
import type { ToolAttachment } from "@/shared/types";

interface SendMessageResponse {
	respuesta: string;
	adjuntos?: ToolAttachment[]
}

export const chatbotService = {
    sendMessage: async(message: string): Promise<SendMessageResponse> => {
        const sessionId = getOrCreateChatIdentifier();
        const payload = {
            identifier: sessionId,
            canal: "WEB",
            mensaje: message
        };
        const response = await apiClient.post("/chatbot/message", payload);
        return response.data.data;
    }
}