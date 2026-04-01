import { apiClient } from "@/core/api";
import type { LiveChatQueueItem } from "../types/live";
import { useAuthStore } from "@/features/auth";

const { user } = useAuthStore.getState();

export const liveChatService = {
    getQueueChats: async (): Promise<LiveChatQueueItem[]> => {
        const response = await apiClient.get<{
            success: boolean;
            data: LiveChatQueueItem[];
        }>("/chats/live/queue");
        return response.data.data;
    },
    getActiveChats: async (): Promise<LiveChatQueueItem[]> => {
        const response = await apiClient.get<{
            success: boolean;
            data: LiveChatQueueItem[];
        }>(`/chats/live/active?id_usuario=${user?.id}`);
        return response.data.data;
    }
}