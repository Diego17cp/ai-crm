import { apiClient } from "@/core/api";
import type { CreateLeadPayload, FiltersState, LeadsResponse, UpdateLeadPayload } from "@/features/leads/types";

export const clientsService = {
    findAll: async (filters: FiltersState) => {
        const queryParams = new URLSearchParams();
        if (filters.q) queryParams.append("q", filters.q);
        if (filters.sexo) queryParams.append("sexo", filters.sexo);
        if (filters.estado_civil) queryParams.append("estado_civil", filters.estado_civil);
        if (filters.es_peruano !== undefined) queryParams.append("es_peruano", String(filters.es_peruano));
        if (filters.solvencia) queryParams.append("solvencia", filters.solvencia);
        if (filters.actitud) queryParams.append("actitud", filters.actitud);
        queryParams.append("page", String(filters.page));
        queryParams.append("limit", String(filters.limit));
        const response = await apiClient.get<LeadsResponse>(`/clientes?${queryParams.toString()}`);
        return response.data;
    },
    create: async (data: CreateLeadPayload) => {
        const response = await apiClient.post("/clientes", data);
        return response.data;
    },
    edit: async (id: number, data: UpdateLeadPayload) => {
        const response = await apiClient.put(`/clientes/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/clientes/${id}`);
        return response.data;
    }
}