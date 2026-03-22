import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "@/shared/hooks/usePagination";
import { lotsService } from "../service/lotsService";
import type { EstadoLote, FiltrosState, Lote } from "../types";
import { apiClient } from "@/core/api";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useLots = () => {
    const queryClient = useQueryClient();

    const { currentPage, perPage, goToPage, setPerPage } = usePagination({
        initialPage: 1,
        initialPerPage: 12
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    const [filters, setFilters] = useState({
        id_proyecto: undefined as number | undefined,
        id_etapa: undefined as number | undefined,
        id_manzana: undefined as number | undefined,
        estado: undefined as EstadoLote | undefined,
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
    };

    const updateFilter = (key: keyof typeof filters, value: string | number | undefined) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value || undefined };
            if (key === 'id_proyecto') {
                newFilters.id_etapa = undefined;
                newFilters.id_manzana = undefined;
            }
            if (key === 'id_etapa') {
                newFilters.id_manzana = undefined;
            }
            return newFilters;
        });
        goToPage(1);
    };

    const clearAllFilters = () => {
        clearSearch();
        setFilters({
            id_proyecto: undefined,
            id_etapa: undefined,
            id_manzana: undefined,
            estado: undefined
        });
        goToPage(1);
    };

    const hasActiveFilters = Boolean(
        debouncedSearch || filters.id_proyecto || filters.id_etapa || filters.id_manzana || filters.estado
    );

    const queryPayload: FiltrosState = {
        page: currentPage,
        limit: perPage,
        q: debouncedSearch || undefined,
        ...filters
    };

    const query = useQuery({
        queryKey: [
            "lotes",
            queryPayload.page,
            queryPayload.limit,
            queryPayload.q,
            queryPayload.id_proyecto,
            queryPayload.id_etapa,
            queryPayload.id_manzana,
            queryPayload.estado
        ],
        queryFn: () => lotsService.findAll(queryPayload),
        placeholderData: (previousData) => previousData
    });
    
    const projectsQuery = useQuery({
        queryKey: ["projects", "all"],
        queryFn: async () => {
            const response = await apiClient.get("/projects/all");
            return response.data.data;
        }
    });
    const etapasQuery = useQuery({
        queryKey: ["etapas", filters.id_proyecto],
        queryFn: async () => {
            if (!filters.id_proyecto) return [];
            const response = await apiClient.get(`/projects/etapas/${filters.id_proyecto}`);
            return response.data.data;
        }
    });
    const manzanasQuery = useQuery({
        queryKey: ["manzanas", filters.id_etapa],
        queryFn: async () => {
            if (!filters.id_etapa) return [];
            const response = await apiClient.get(`/projects/etapas/${filters.id_etapa}/manzanas`);
            return response.data.data;
        }
    });

    const useCreateLoteMutation = (data: Omit<Lote, "id" | "created_at" | "imagenes" | "manzana">) => useMutation({
        mutationFn: () => lotsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lotes"] });
            toast.success("Lote creado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al crear lote";
            toast.error(message);
        }
    });
    const useUpdateLoteMutation = (id: number, data: Partial<Omit<Lote, "id" | "created_at" | "imagenes" | "manzana">>) => useMutation({
        mutationFn: () => lotsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lotes"] });
            toast.success("Lote actualizado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al actualizar lote";
            toast.error(message);
        }
    });
    const useDeleteLoteMutation = (id: number) => useMutation({
        mutationFn: () => lotsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lotes"] });
            toast.success("Lote eliminado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al eliminar lote";
            toast.error(message);
        }
    });

    return {
        ...query,
        lotes: query.data?.data || [],
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
        proyectos: projectsQuery.data || [],
        loadingProyectos: projectsQuery.isLoading,
        errorProyectos: projectsQuery.error,
        etapas: etapasQuery.data || [],
        loadingEtapas: etapasQuery.isLoading,
        errorEtapas: etapasQuery.error,
        manzanas: manzanasQuery.data || [],
        loadingManzanas: manzanasQuery.isLoading,
        errorManzanas: manzanasQuery.error,
        useCreateLoteMutation,
        useUpdateLoteMutation,
        useDeleteLoteMutation
    };
};