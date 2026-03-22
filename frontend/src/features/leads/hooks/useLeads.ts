import { usePagination } from "@/shared/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Actitud, CreateLeadPayload, EstadoCivil, FiltersState, Sexo, Solvencia, UpdateLeadPayload } from "../types";
import { leadsService } from "../service/leadsService";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useLeads = () => {
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
            "leads",
            filtersPayload.page,
            filtersPayload.limit,
            filtersPayload.q,
            filtersPayload.sexo,
            filtersPayload.estado_civil,
            filtersPayload.es_peruano,
            filtersPayload.solvencia,
            filtersPayload.actitud
        ],
        queryFn: () => leadsService.findAll(filtersPayload),
    });
    const useCreateLeadMutation = (data: CreateLeadPayload) => useMutation({
        mutationFn: () => leadsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead creado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al crear el lead";
            toast.error(message);
        }
    });
    const useEditLeadMutation = (id: number, data: UpdateLeadPayload) => useMutation({
        mutationFn: () => leadsService.edit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead actualizado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al actualizar el lead";
            toast.error(message);
        }
    });
    const useDeleteLeadMutation = (id: number) => useMutation({
        mutationFn: () => leadsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead eliminado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al eliminar el lead";
            toast.error(message);
        }
    });

    return {
        ...query,
        leads: query.data?.data || [],
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
        useCreateLeadMutation,
        useEditLeadMutation,
        useDeleteLeadMutation
    }
}