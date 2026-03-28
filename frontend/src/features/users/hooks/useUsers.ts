import { usePagination } from "@/shared/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { CreateUserPayload, UpdateUserPayload, UserFilters } from "../types";
import { usersService } from "../services/usersService";
import type { ApiError } from "@/core/types";
import { toast } from "sonner";

export const useUsers = () => {
    const queryClient = useQueryClient();
    const { currentPage, perPage, goToPage, setPerPage } = usePagination({
        initialPage: 1,
        initialPerPage: 12
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        estado: undefined as "ACTIVO" | "INACTIVO" | undefined,
        id_rol: undefined as number | undefined,
    });
    useEffect(() => {
        const handler = setTimeout(() => {
            if (debouncedSearch !== searchTerm) {
                setDebouncedSearch(searchTerm);
                goToPage(1);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, debouncedSearch, goToPage]);

    const handleSearch = (value: string) => setSearchTerm(value);
    const clearSearch = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        goToPage(1);
    }
    const updateFilter = (key: keyof typeof filters, value: string | number | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
        goToPage(1);
    };
    const clearAllFilters = () => {
        clearSearch();
        setFilters({
            estado: undefined,
            id_rol: undefined,
        });
        goToPage(1);
    };
    const hasActiveFilters = Boolean(debouncedSearch || filters.estado || filters.id_rol);

    const filtersPayload: UserFilters = {
        page: currentPage,
        limit: perPage,
        q: debouncedSearch || undefined,
        ...filters
    };
    const query = useQuery({
        queryKey: [
            "users",
            filtersPayload.page,
            filtersPayload.limit,
            filtersPayload.estado,
            filtersPayload.id_rol,
            filtersPayload.q,
        ],
        queryFn: () => usersService.getUsers(filtersPayload),
        placeholderData: (prev) => prev
    });
    const useCreateUserMutation = (payload: CreateUserPayload) => useMutation({
        mutationFn: () => usersService.createUser(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario creado exitosamente");
        },
        onError: (error: ApiError) => {
            console.error("Error creating user:", error);
            const errorMessage = error.response?.data?.message || "Error al crear el usuario";
            toast.error(errorMessage);
        }
    });
    const useUpdateUserMutation = (id: string, payload: UpdateUserPayload) => useMutation({
        mutationFn: () => usersService.updateUser(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario actualizado exitosamente");
        },
        onError: (error: ApiError) => {
            console.error("Error updating user:", error);
            const errorMessage = error.response?.data?.message || "Error al actualizar el usuario";
            toast.error(errorMessage);
        }
    });
    const useDeleteUserMutation = (id: string) => useMutation({
        mutationFn: () => usersService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario eliminado exitosamente");
        },
        onError: (error: ApiError) => {
            console.error("Error deleting user:", error);
            const errorMessage = error.response?.data?.message || "Error al eliminar el usuario";
            toast.error(errorMessage);
        }
    });

    return {
        ...query,
        users: query.data?.data || [],
        meta: query.data?.meta,
        page: currentPage,
        limit: perPage,
        goToPage,
        setPerPage,
        searchTerm,
        handleSearch,
        clearSearch,
        filters,
        updateFilter,
        clearAllFilters,
        hasActiveFilters,
        useCreateUserMutation,
        useUpdateUserMutation,
        useDeleteUserMutation,
    }
}