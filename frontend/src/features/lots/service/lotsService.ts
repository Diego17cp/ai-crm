import { apiClient } from "@/core/api";
import type {
	FiltrosState,
	ImageUpdateInput,
	Lote,
	LoteImagenLocal,
	LotesResponse,
} from "../types";

export const lotsService = {
	findAll: async (filters: FiltrosState) => {
		const queryParams = new URLSearchParams();
		if (filters.q) queryParams.append("q", filters.q);
		if (filters.id_proyecto)
			queryParams.append("id_proyecto", String(filters.id_proyecto));
		if (filters.id_etapa)
			queryParams.append("id_etapa", String(filters.id_etapa));
		if (filters.id_manzana)
			queryParams.append("id_manzana", String(filters.id_manzana));
		if (filters.estado) queryParams.append("estado", filters.estado);
		queryParams.append("page", String(filters.page));
		queryParams.append("limit", String(filters.limit));
		const response = await apiClient.get<LotesResponse>(
			`/lotes?${queryParams.toString()}`,
		);
		return response.data;
	},
	create: async (
		loteData: Omit<Lote, "id" | "created_at" | "imagenes" | "manzana">,
		imagenes: LoteImagenLocal[],
	) => {
		const formData = new FormData();
		Object.entries(loteData).forEach(([key, value]) => {
			if (value !== undefined && value !== null)
				formData.append(key, String(value));
		});
		const indicePrincipal = imagenes.findIndex((img) => img.isPrincipal);
		formData.append(
			"indice_principal",
			String(indicePrincipal >= 0 ? indicePrincipal : 0),
		);
		imagenes.forEach((img) => formData.append("imagenes", img.file));
		const response = await apiClient.post("/lotes", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	},
	update: async (
		id: number,
		loteData: Partial<
			Omit<Lote, "id" | "created_at" | "imagenes" | "manzana">
		>,
		imagenesUpdate: ImageUpdateInput,
		archivosNuevos: File[],
	) => {
		const formData = new FormData();

		Object.entries(loteData).forEach(([key, value]) => {
			if (value !== undefined && value !== null)
				formData.append(key, String(value));
		});
		formData.append("imagenes", JSON.stringify(imagenesUpdate));
		archivosNuevos.forEach((file) =>
			formData.append("imagenes_nuevas", file),
		);
		const response = await apiClient.put(`/lotes/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	},
	delete: async (id: number) => {
		const response = await apiClient.delete(`/lotes/${id}`);
		return response.data.data;
	},
};
