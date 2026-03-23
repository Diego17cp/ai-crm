import { apiClient } from "@/core/api";
import type { AppointmentsResponse, CreateAppointmentPayload, EditAppointmentPayload, FiltersState } from "../types";

export const appointmentsService = {
    getAppointments: async (filters: FiltersState) => {
        const params = new URLSearchParams();
        params.append("page", filters.page.toString());
        params.append("limit", filters.limit.toString());
        if (filters.estado_cita) params.append("estado_cita", filters.estado_cita);
        if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
        if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
        if (filters.puntuacion) params.append("puntuacion", filters.puntuacion.toString());
        if (filters.id_proyecto) params.append("id_proyecto", filters.id_proyecto.toString());
        if (filters.id_usuario_responsable) params.append("id_usuario_responsable", filters.id_usuario_responsable);
        const response = await apiClient.get<AppointmentsResponse>(`/citas?${params.toString()}`);
        return response.data;
    },
    edit: async (id: number, payload: Partial<EditAppointmentPayload>) => {
        const response = await apiClient.put(`/citas/${id}`, payload);
        return response.data;
    },
    create: async (payload: CreateAppointmentPayload) => {
        const response = await apiClient.post(`/citas`, payload);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/citas/${id}`);
        return response.data;
    }
}