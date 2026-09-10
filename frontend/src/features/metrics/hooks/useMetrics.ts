import { useQuery } from "@tanstack/react-query";
import { metricsService } from "../service/metricsService";
import { toISODate } from "../utils/metricsFormatters";

export const useAdvisorMetrics = (
	idUsuario: string,
	desde: Date,
	hasta: Date,
) =>
	useQuery({
		queryKey: [
			"advisor-metrics",
			idUsuario,
			toISODate(desde),
			toISODate(hasta),
		],
		queryFn: () =>
			metricsService.getAdvisorMetrics(
				idUsuario,
				toISODate(desde),
				toISODate(hasta),
			),
		enabled: Boolean(idUsuario),
	});

export const useAdminOverview = (desde: Date, hasta: Date) =>
	useQuery({
		queryKey: ["admin-overview", toISODate(desde), toISODate(hasta)],
		queryFn: () =>
			metricsService.getAdminOverview(toISODate(desde), toISODate(hasta)),
	});
