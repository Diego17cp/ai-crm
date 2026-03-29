import { apiClient } from "@/core/api";
import type { AllChatsResponse, ChatDetailsResponse, ChatFilters } from "../types";

export const chatsService = {
    getChats: async (query: ChatFilters) => {
        const params = new URLSearchParams();
        if (query.q) params.append("q", String(query.q));
        if (query.estado) params.append("estado", String(query.estado));
        if (query.canal) params.append("canal", String(query.canal));
        params.append("page", String(query.page));
        params.append("limit", String(query.limit));
        const response = await apiClient.get<AllChatsResponse>(`/chats?${params.toString()}`);
        return response.data;
    },
    getChatById: async (chatId: string) => {
        const response = await apiClient.get<ChatDetailsResponse>(`/chats/${chatId}`);
        return response.data;
    }
}