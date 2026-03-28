import { apiClient } from "@/core/api";
import type { CreateUserPayload, UpdateUserPayload, UserFilters, UserResponse } from "../types";

export const usersService = {
    getUsers: async (filters: UserFilters) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", filters.page.toString());
        queryParams.append("limit", filters.limit.toString());
        if (filters.estado) queryParams.append("estado", filters.estado);
        if (filters.id_rol) queryParams.append("id_rol", filters.id_rol.toString());
        if (filters.q) queryParams.append("q", filters.q);
        const response = await apiClient.get<UserResponse>(`/users?${queryParams.toString()}`);
        return response.data;
    },
    createUser: async (payload: CreateUserPayload) => {
        const response = await apiClient.post("/users", payload);
        return response.data;
    },
    updateUser: async (id: string, payload: UpdateUserPayload) => {
        const response = await apiClient.patch(`/users/${id}`, payload);
        return response.data;
    },
    deleteUser: async (id: string) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    }
}