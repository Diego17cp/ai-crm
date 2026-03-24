import { usePagination } from "@/shared/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react";
import type { AllSalesFilters, CreateSalePayload, EstadoContrato, EstadoVenta, TipoPago } from "../types";
import { salesService } from "../service/salesService";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useSales = () => {
    const queryClient = useQueryClient();
    const { currentPage, perPage, goToPage, setPerPage } = usePagination({
        initialPage: 1,
        initialPerPage: 12
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        q: undefined as string | undefined,
        estado_venta: undefined as EstadoVenta | undefined,
        estado_contrato: undefined as EstadoContrato | undefined,
        tipo_pago: undefined as TipoPago | undefined,
        fecha_inicio: undefined as string | undefined,
        fecha_fin: undefined as string | undefined,
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
    
    const updateFilter = (key: keyof typeof filters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
        goToPage(1);
    };
    const clearAllFilters = () => {
        clearSearch();
        setFilters({
            q: undefined,
            estado_venta: undefined,
            estado_contrato: undefined,
            tipo_pago: undefined,
            fecha_inicio: undefined,
            fecha_fin: undefined,
        });
        goToPage(1);
    };
    const hasActiveFilters = Boolean(debouncedSearch || filters.estado_venta || filters.estado_contrato || filters.tipo_pago || filters.fecha_inicio || filters.fecha_fin);

    const filtersPayload: AllSalesFilters = {
        ...filters,
        page: currentPage,
        limit: perPage,
        q: debouncedSearch || undefined,
    };

    const query = useQuery({
        queryKey: [
            "ventas",
            filtersPayload.page,
            filtersPayload.limit,
            filtersPayload.estado_venta,
            filtersPayload.estado_contrato,
            filtersPayload.tipo_pago,
            filtersPayload.q,
            filtersPayload.fecha_inicio,
            filtersPayload.fecha_fin,
        ],
        queryFn: () => salesService.findAll(filtersPayload),
        placeholderData: (prev) => prev
    });

    const useCreateSaleMutation = (payload: CreateSalePayload) => useMutation({
        mutationFn: () => salesService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ventas"] });
            toast.success("Venta creada exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.message || "Error al crear la venta";
            toast.error(message);
        }
    })

    return {
        ...query,
        sales: query.data?.data || [],
        meta: query.data?.meta,
        page: currentPage,
        limit: perPage,
        goToPage,
        setPerPage,
        searchTerm,
        handleSearch,
        clearSearch,
        updateFilter,
        clearAllFilters,
        hasActiveFilters, 
        filters,
        useCreateSaleMutation
    }
}