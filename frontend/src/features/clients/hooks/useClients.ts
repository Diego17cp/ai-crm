import { usePagination } from "@/shared/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Actitud, CreateLeadPayload, EstadoCivil, FiltersState, Sexo, Solvencia, UpdateLeadPayload } from "@/features/leads/types";
import { clientsService } from "../service/clientsService";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useClients = () => {
    const queryClient = useQueryClient();
    const { currentPage, perPage, goToPage, setPerPage } = usePagination({
        initialPage: 1,
        initialPerPage: 12
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        sexo: undefined as Sexo | undefined,
        estado_civil: undefined as EstadoCivil | undefined,
        es_peruano: undefined as boolean | undefined,
        solvencia: undefined as Solvencia | undefined,
        actitud: undefined as Actitud | undefined,
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

    const updateFilter = (key: keyof typeof filters, value: string | boolean | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
        goToPage(1);
    };

    const clearAllFilters = () => {
        clearSearch();
        setFilters({
            sexo: undefined,
            estado_civil: undefined,
            es_peruano: undefined,
            solvencia: undefined,
            actitud: undefined,
        });
        goToPage(1);
    };
    const hasActiveFilters = Boolean(debouncedSearch || filters.sexo || filters.estado_civil || filters.es_peruano !== undefined || filters.solvencia || filters.actitud);

    const filtersPayload: FiltersState = {
        page: currentPage,
        limit: perPage,
        q: debouncedSearch || undefined,
        ...filters
    };

    const query = useQuery({
        queryKey: [
            "clients",
            filtersPayload.page,
            filtersPayload.limit,
            filtersPayload.q,
            filtersPayload.sexo,
            filtersPayload.estado_civil,
            filtersPayload.es_peruano,
            filtersPayload.solvencia,
            filtersPayload.actitud
        ],
        queryFn: () => clientsService.findAll(filtersPayload),
        placeholderData: (previousData) => previousData
    });
    const useCreateClientMutation = (data: CreateLeadPayload) => useMutation({
        mutationFn: () => clientsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente creado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al crear el cliente";
            toast.error(message);
        }
    });
    const useEditClientMutation = (id: number, data: UpdateLeadPayload) => useMutation({
        mutationFn: () => clientsService.edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente actualizado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al actualizar el cliente";
            toast.error(message);
        }
    });
    const useDeleteClientMutation = (id: number) => useMutation({
        mutationFn: () => clientsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente eliminado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al eliminar el cliente";
            toast.error(message);
        }
    });

    return {
        ...query,
        clients: query.data?.data || [],
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
        useCreateClientMutation,
        useEditClientMutation,
        useDeleteClientMutation
    }
}