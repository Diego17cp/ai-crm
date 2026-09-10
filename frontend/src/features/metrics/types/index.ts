export interface DailyMetrics {
	fecha: string;
	clientes_atendidos: number;
	citas_agendadas: number;
	citas_atendidas: number;
	cotizaciones_generadas: number;
	ventas_cerradas: number;
	monto_vendido: number;
	tiempo_respuesta_prom_seg: number | null;
	puntuacion_atencion_prom: number | null;
}

export interface AdvisorMetricsSummary {
	clientes_atendidos: number;
	citas_agendadas: number;
	citas_atendidas: number;
	cotizaciones_generadas: number;
	ventas_cerradas: number;
	monto_vendido: number;
	tasa_cierre: number;
	tiempo_respuesta_prom_seg: number | null;
	puntuacion_atencion_prom: number | null;
}

export interface AdvisorMetricsResponse {
	serie_diaria: DailyMetrics[];
	resumen: AdvisorMetricsSummary;
}

export interface LeaderboardItem {
	id_usuario: string;
	nombre: string;
	ventas_cerradas: number;
	monto_vendido: number;
	tiempo_respuesta_prom_seg: number | null;
	puntuacion_atencion_prom: number | null;
}

export interface LeadsByStateItem {
	estado: string;
	_count: number;
}

export interface AdminOverviewResponse {
	leaderboard: LeaderboardItem[];
	leads_por_estado: LeadsByStateItem[];
}
