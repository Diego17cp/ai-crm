import { PrismaClient } from "generated/prisma/client";

export class MetricsUseCases {
	constructor(private prisma: PrismaClient) {}

	async getAdvisorMetrics(idUsuario: string, desde: Date, hasta: Date) {
		const registros = await this.prisma.metricasAsesorDiarias.findMany({
			where: {
				id_usuario: idUsuario,
				fecha: {
					gte: desde,
					lte: hasta,
				},
			},
		});
		const totales = registros.reduce(
			(acc, r) => ({
				clientes_atendidos:
					acc.clientes_atendidos + r.clientes_atendidos,
				citas_agendadas: acc.citas_agendadas + r.citas_agendadas,
				citas_atendidas: acc.citas_atendidas + r.citas_atendidas,
				cotizaciones_generadas:
					acc.cotizaciones_generadas + r.cotizaciones_generadas,
				ventas_cerradas: acc.ventas_cerradas + r.ventas_cerradas,
				monto_vendido: acc.monto_vendido + Number(r.monto_vendido),
				sumaTiempoRespuesta:
					acc.sumaTiempoRespuesta +
					(r.tiempo_respuesta_prom_seg ?? 0) * r.respuestas_contadas,
				totalRespuestas: acc.totalRespuestas + r.respuestas_contadas,
				sumaPuntuacion:
					acc.sumaPuntuacion +
					Number(r.puntuacion_atencion_prom ?? 0) *
						r.evaluaciones_contadas,
				totalEvaluaciones:
					acc.totalEvaluaciones + r.evaluaciones_contadas,
			}),
			{
				clientes_atendidos: 0,
				citas_agendadas: 0,
				citas_atendidas: 0,
				cotizaciones_generadas: 0,
				ventas_cerradas: 0,
				monto_vendido: 0,
				sumaTiempoRespuesta: 0,
				totalRespuestas: 0,
				sumaPuntuacion: 0,
				totalEvaluaciones: 0,
			},
		);
		return {
			serie_diaria: registros,
			resumen: {
				...totales,
				tasa_cierre:
					totales.clientes_atendidos > 0
						? totales.ventas_cerradas / totales.clientes_atendidos
						: 0,
				tiempo_respuesta_prom_seg:
					totales.totalRespuestas > 0
						? Math.round(
								totales.sumaTiempoRespuesta /
									totales.totalRespuestas,
							)
						: null,
				puntuacion_atencion_prom:
					totales.totalEvaluaciones > 0
						? totales.sumaPuntuacion / totales.totalEvaluaciones
						: null,
			},
		};
	}
	async getAdminOverview(desde: Date, hasta: Date) {
		const [porAsesor, leadsPorEstado] = await Promise.all([
			this.prisma.metricasAsesorDiarias.findMany({
				where: { fecha: { gte: desde, lte: hasta } },
				include: {
					usuario: { select: { nombres: true, apellidos: true } },
				},
			}),
			this.prisma.leads.groupBy({
				by: ["estado"],
				where: { created_at: { gte: desde, lte: hasta } },
				_count: true,
			}),
		]);
		const porAsesorAgrupado = new Map<string, any>();
		for (const r of porAsesor) {
			const key = r.id_usuario;
			const acc = porAsesorAgrupado.get(key) ?? {
				nombre: `${r.usuario.nombres} ${r.usuario.apellidos ?? ""}`.trim(),
				ventas_cerradas: 0,
				monto_vendido: 0,
				sumaTiempo: 0,
				totalResp: 0,
				sumaPunt: 0,
				totalEval: 0,
			};
			acc.ventas_cerradas += r.ventas_cerradas;
			acc.monto_vendido += Number(r.monto_vendido);
			acc.sumaTiempo +=
				(r.tiempo_respuesta_prom_seg ?? 0) * r.respuestas_contadas;
			acc.totalResp += r.respuestas_contadas;
			acc.sumaPunt +=
				Number(r.puntuacion_atencion_prom ?? 0) *
				r.evaluaciones_contadas;
			acc.totalEval += r.evaluaciones_contadas;
			porAsesorAgrupado.set(key, acc);
		}
		const leaderboard = Array.from(porAsesorAgrupado.entries()).map(
			([id_usuario, a]) => ({
				id_usuario,
				nombre: a.nombre,
				ventas_cerradas: a.ventas_cerradas,
				monto_vendido: a.monto_vendido,
				tiempo_respuesta_prom_seg:
					a.totalResp > 0
						? Math.round(a.sumaTiempo / a.totalResp)
						: null,
				puntuacion_atencion_prom:
					a.totalEval > 0 ? a.sumaPunt / a.totalEval : null,
			}),
		);

		return { leaderboard, leads_por_estado: leadsPorEstado };
	}
}
