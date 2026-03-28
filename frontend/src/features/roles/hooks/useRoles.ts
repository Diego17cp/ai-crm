import { useQuery } from "@tanstack/react-query"
import { rolesService } from "../services/rolesService"

export const useRoles = () => {
    const rolesQuery = useQuery({
        queryKey: ["roles"],
        queryFn: rolesService.getRoles,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    return {
        roles: rolesQuery.data?.data || [],
        loadingRoles: rolesQuery.isLoading,
        errorRoles: rolesQuery.error,
    }
}