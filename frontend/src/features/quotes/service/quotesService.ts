import { apiClient } from "@/core/api";
import { useAuthStore } from "@/features/auth";
import type { QuoteQueueItem } from "../types/live";
import type { QuoteDetail } from "../types";

const { user } = useAuthStore.getState();

export const quotesService = {
	getPendingQueue: async (): Promise<QuoteQueueItem[]> => {
		const response = await apiClient.get<{ success: boolean; data: QuoteQueueItem[] }>("/cotizaciones/queue");
		return response.data.data;
	},
	getMyReviews: async (): Promise<QuoteQueueItem[]> => {
		const response = await apiClient.get<{ success: boolean; data: QuoteQueueItem[] }>(`/cotizaciones/mine?id_usuario=${user?.id}`);
		return response.data.data;
	},
	getQuoteById: async (quoteId: number): Promise<{ data: QuoteDetail }> => {
		const response = await apiClient.get<{ success: boolean; data: QuoteDetail }>(`/cotizaciones/${quoteId}`);
		return response.data;
	},
};