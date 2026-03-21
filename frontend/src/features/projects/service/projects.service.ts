import { apiClient } from "@/core/api/apiClient";
import type { PaginatedResponse, Proyecto } from "../types";

export const projectsService = {
    getAll: async (page = 1, limit = 10, q?: string): Promise<PaginatedResponse<Proyecto>> => {
        const response = await apiClient.get(`/projects?page=${page}&limit=${limit}${q ? `&q=${q}` : ''}`);
        return response.data;
    },
    createProject: async (idUbigeo: string, nombre: string, abreviatura?: string, ubicacion?: string, descripcion?: string) => {
        const response = await apiClient.post('/projects', { id_ubigeo: idUbigeo, nombre, abreviatura, ubicacion, descripcion });
        return response.data;
    },
    editProject: async (id: number, idUbigeo: string, nombre: string, abreviatura?: string, ubicacion?: string, descripcion?: string) => {
        const response = await apiClient.put(`/projects/${id}`, { id_ubigeo: idUbigeo, nombre, abreviatura, ubicacion, descripcion });
        return response.data;
    },
    toggleProjectStatus: async (id: number) => {
        // TODO: Cambiar endpoint cuando esté listo en backend
        const response = await apiClient.delete(`/projects/${id}`);
        return response.data;
    },
    createEtapa: async (id_proyecto: number, nombre: string) => {
        const response = await apiClient.post(`/projects/${id_proyecto}/etapas`, { nombre });
        return response.data;
    },
    editEtapa: async (id_etapa: number, nombre: string) => {
        const response = await apiClient.put(`/projects/etapas/${id_etapa}`, { nombre });
        return response.data;
    },
    toggleEtapaStatus: async (id_etapa: number) => {
        // TODO: Cambiar endpoint cuando esté listo en backend
        const response = await apiClient.delete(`/projects/etapas/${id_etapa}`);
        return response.data;
    },
    createManzanas: async (id_etapa: number, codigos: string[]) => {
        const response = await apiClient.post(`/projects/etapas/${id_etapa}/manzanas/batch`, { codigos });
        return response.data;
    },
    editManzana: async (id_manzana: number, codigo: string) => {
        const response = await apiClient.put(`/projects/manzanas/${id_manzana}`, { codigo });
        return response.data;
    },
    toggleManzanaStatus: async (id_manzana: number) => {
        // TODO: Cambiar endpoint cuando esté listo en backend
        const response = await apiClient.delete(`/projects/manzanas/${id_manzana}`);
        return response.data;
    }
};