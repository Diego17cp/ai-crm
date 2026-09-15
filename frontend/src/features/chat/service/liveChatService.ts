import { apiClient } from "@/core/api";
import type { LiveChatQueueItem } from "../types/live";
import type { User } from "@/core/types";

export const liveChatService = {
	getQueueChats: async (): Promise<LiveChatQueueItem[]> => {
		const response = await apiClient.get<{
			success: boolean;
			data: LiveChatQueueItem[];
		}>("/chats/live/queue");
		return response.data.data;
	},
	getActiveChats: async (user: User | null): Promise<LiveChatQueueItem[]> => {
		const response = await apiClient.get<{
			success: boolean;
			data: LiveChatQueueItem[];
		}>(`/chats/live/active?id_usuario=${user?.id}`);
		return response.data.data;
	},
};
