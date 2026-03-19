import { apiClient } from "@/core/api";
import { getOrCreateChatIdentifier } from "../utils/chatSession"

export const chatbotService = {
    sendMessage: async(message: string) => {
        const sessionId = getOrCreateChatIdentifier();
        const payload = {
            identifier: sessionId,
            canal: "WEB",
            mensaje: message
        };
        const response = await apiClient.post("/chatbot/message", payload);
        return response.data.data.respuesta;
    }
}