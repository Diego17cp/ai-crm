import { apiClient } from "@/core/api"
import type { RoleResponse } from "../types";

export const rolesService = {
    getRoles: async () => {
        const response = await apiClient.get<RoleResponse>("/roles");
        return response.data;
    }
}