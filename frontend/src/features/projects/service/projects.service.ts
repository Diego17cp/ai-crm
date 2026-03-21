import { apiClient } from "@/core/api/apiClient";
import type { PaginatedResponse, Proyecto } from "../types";

export const projectsService = {
    getAll: async (page = 1, limit = 10, q?: string): Promise<PaginatedResponse<Proyecto>> => {
        const response = await apiClient.get(`/projects?page=${page}&limit=${limit}${q ? `&q=${q}` : ''}`);
        return response.data;
    }
};