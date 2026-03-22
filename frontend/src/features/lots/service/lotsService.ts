import { apiClient } from "@/core/api";
import type { FiltrosState, Lote, LotesResponse } from "../types";

export const lotsService = {
    findAll: async (filters: FiltrosState) => {
        const queryParams = new URLSearchParams();
        if (filters.q) queryParams.append("q", filters.q);
        if (filters.id_proyecto) queryParams.append("id_proyecto", String(filters.id_proyecto));
        if (filters.id_etapa) queryParams.append("id_etapa", String(filters.id_etapa));
        if (filters.id_manzana) queryParams.append("id_manzana", String(filters.id_manzana));
        if (filters.estado) queryParams.append("estado", filters.estado);
        queryParams.append("page", String(filters.page));
        queryParams.append("limit", String(filters.limit));
        const response = await apiClient.get<LotesResponse>(`/lotes?${queryParams.toString()}`);
        return response.data;
    },
    create: async (loteData: Omit<Lote, "id" | "created_at" | "imagenes" | "manzana">) => {
        const response = await apiClient.post("/lotes", loteData);
        return response.data.data;
    },
    update: async (id: number, loteData: Partial<Omit<Lote, "id" | "created_at" | "imagenes" | "manzana">>) => {
        const response = await apiClient.put(`/lotes/${id}`, loteData);
        return response.data.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/lotes/${id}`);
        return response.data.data;
    }
}