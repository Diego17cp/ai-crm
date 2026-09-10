import { apiClient } from "@/core/api";
import type { AdvisorMetricsResponse, AdminOverviewResponse } from "../types";

export const metricsService = {
	getAdvisorMetrics: async (
		idUsuario: string,
		desde: string,
		hasta: string,
	) => {
		const response = await apiClient.get<{
			success: boolean;
			data: AdvisorMetricsResponse;
		}>(`/metricas/asesor/${idUsuario}`, { params: { desde, hasta } });
		return response.data.data;
	},
	getAdminOverview: async (desde: string, hasta: string) => {
		const response = await apiClient.get<{
			success: boolean;
			data: AdminOverviewResponse;
		}>("/metricas/admin/resumen", { params: { desde, hasta } });
		return response.data.data;
	},
};
