import { apiClient } from "@/core/api";
import type { AllSalesFilters, AllSalesResponse, CobrosResponse, CollectionsBoardFilters, CreateSalePayload, MetodoPago, VentaByIdResponse } from "../types";

export const salesService = {
    findAll: async (filters: AllSalesFilters) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", filters.page.toString());
        queryParams.append("limit", filters.limit.toString());
        if (filters.estado_venta) queryParams.append("estado_venta", filters.estado_venta);
        if (filters.estado_contrato) queryParams.append("estado_contrato", filters.estado_contrato);
        if (filters.tipo_pago) queryParams.append("tipo_pago", filters.tipo_pago);
        if (filters.q) queryParams.append("q", filters.q);
        if (filters.fecha_inicio) queryParams.append("fecha_inicio", filters.fecha_inicio);
        if (filters.fecha_fin) queryParams.append("fecha_fin", filters.fecha_fin);
        const response = await apiClient.get<AllSalesResponse>(`/ventas?${queryParams.toString()}`);
        return response.data;
    },
    create: async (payload: CreateSalePayload) => {
        const response = await apiClient.post(`/ventas`, payload);
        return response.data;
    },
    findById: async (id: number) => {
        const response = await apiClient.get<VentaByIdResponse>(`/ventas/${id}`);
        return response.data;
    },
    payQuota: async (id: number, metodoPago: MetodoPago, /* Aqui la imagen de comprobante a futuro */ ) => {
        const response = await apiClient.patch(`/ventas/cuotas/${id}/pay`, { 
            metodo_pago: metodoPago,
        });
        return response.data;
    },
    getCollectionsBoard: async (filters: CollectionsBoardFilters) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", filters.page.toString());
        queryParams.append("limit", filters.limit.toString());
        if (filters.filtro) queryParams.append("filtro", filters.filtro);
        if (filters.dias_proximas) queryParams.append("dias", filters.dias_proximas.toString());
        const response = await apiClient.get<CobrosResponse>(`/ventas/cobranzas?${queryParams.toString()}`);
        return response.data;
    }
}