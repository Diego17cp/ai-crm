import { apiClient } from "@/core/api";
import type { AllChatsResponse, ChatDetailsResponse, ChatFilters, ChatStatus } from "../types";

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
    },
    getChatsBySessionId: async (sessionId: string) => {
        const response = await apiClient.get<ChatDetailsResponse>(`/chats/session/${sessionId}`);
        return response.data;
    },
    updateStatusChat: async (chatId: string, newStatus: ChatStatus) => {
        const response = await apiClient.patch(`/chats/${chatId}/status`, { newStatus });
        return response.data;
    }
}