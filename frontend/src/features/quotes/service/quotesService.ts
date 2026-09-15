import { apiClient } from "@/core/api";
import type { QuoteQueueItem } from "../types/live";
import type { AllQuotesResponse, CreateQuotePayload, QuoteDetail, QuoteFilters } from "../types";
import type { User } from "@/core/types";


export const quotesService = {
	getPendingQueue: async (): Promise<QuoteQueueItem[]> => {
		const response = await apiClient.get<{ success: boolean; data: QuoteQueueItem[] }>("/cotizaciones/queue");
		return response.data.data;
	},
	getMyReviews: async (user: User | null): Promise<QuoteQueueItem[]> => {
		const response = await apiClient.get<{ success: boolean; data: QuoteQueueItem[] }>(`/cotizaciones/mine?id_usuario=${user?.id}`);
		return response.data.data;
	},
	getQuoteById: async (quoteId: number): Promise<{ data: QuoteDetail }> => {
		const response = await apiClient.get<{ success: boolean; data: QuoteDetail }>(`/cotizaciones/${quoteId}`);
		return response.data;
	},
  getAll: async (filters: QuoteFilters) => {
    const params = new URLSearchParams();
    if (filters.q) params.append("q", String(filters.q));
    if (filters.state) params.append("estado", String(filters.state));
    if (filters.generatedBy) params.append("generado_por", String(filters.generatedBy));
    if (filters.userId) params.append("id_usuario", String(filters.userId));
    params.append("page", String(filters.page));
    params.append("limit", String(filters.limit));
    const response = await apiClient.get<AllQuotesResponse>(
      `/cotizaciones?${params.toString()}`,
    );
    return response.data;
  },
	createManual: async (payload: CreateQuotePayload) => {
		const response = await apiClient.post("/cotizaciones", payload)
		return response.data
	}
};