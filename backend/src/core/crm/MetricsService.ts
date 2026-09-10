import { EstadoLead, Leads, Prisma } from "generated/prisma/client";

export class MetricsService {
	async onLeadTransition(
		lead: Leads,
		nuevoEstado: EstadoLead,
		idUsuario: string | undefined,
		tx: Prisma.TransactionClient,
	): Promise<void> {
		const hoy = this.today();

		switch (nuevoEstado) {
			case "CONTACTADO":
				if (idUsuario)
					await this.increment(tx, idUsuario, hoy, {
						clientes_atendidos: 1,
					});
				break;
			case "GANADO":
				if (idUsuario)
					await this.increment(tx, idUsuario, hoy, {
						ventas_cerradas: 1,
					});
				break;
		}
	}
	async incrementCitaAgendada(
		idUsuario: string,
		tx: Prisma.TransactionClient,
	) {
		await this.increment(tx, idUsuario, this.today(), {
			citas_agendadas: 1,
		});
	}
	async incrementCitaAtendida(
		idUsuario: string,
		tx: Prisma.TransactionClient,
	) {
		await this.increment(tx, idUsuario, this.today(), {
			citas_atendidas: 1,
		});
	}
	async incrementCotizacionGenerada(
		idUsuario: string,
		tx: Prisma.TransactionClient,
	) {
		await this.increment(tx, idUsuario, this.today(), {
			cotizaciones_generadas: 1,
		});
	}
	async incrementVentaCerrada(
		idUsuario: string,
		monto: number,
		tx: Prisma.TransactionClient,
	) {
		await this.increment(tx, idUsuario, this.today(), {
			ventas_cerradas: 1,
			monto_vendido: monto,
		});
	}
	private async increment(
		tx: Prisma.TransactionClient,
		idUsuario: string,
		fecha: Date,
		delta: Partial<Record<string, number>>,
	) {
		await tx.metricasAsesorDiarias.upsert({
			where: { id_usuario_fecha: { id_usuario: idUsuario, fecha } },
			update: Object.fromEntries(
				Object.entries(delta).map(([k, v]) => [k, { increment: v }]),
			),
			create: { id_usuario: idUsuario, fecha, ...delta },
		});
	}
	private today(): Date {
		const d = new Date();
		return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	}
	private async updateProm(
		tx: Prisma.TransactionClient,
		userId: string,
		promField: "tiempo_respuesta_prom_seg" | "puntuacion_atencion_prom",
		countField: "respuestas_contadas" | "evaluaciones_contadas",
		newValue: number,
	) {
		const date = this.today();
		const register = await tx.metricasAsesorDiarias.findUnique({
			where: { id_usuario_fecha: { id_usuario: userId, fecha: date } },
		});
		if (!register) {
			await tx.metricasAsesorDiarias.create({
				data: {
					id_usuario: userId,
					fecha: date,
					[promField]: newValue,
					[countField]: 1,
				},
			});
			return;
		}
		const currentCount = register[countField];
		const currentAvg = Number(register[promField] ?? 0);
		const newCount = currentCount + 1;
		const newAvg = currentAvg + (newValue - currentAvg) / newCount;
		await tx.metricasAsesorDiarias.update({
			where: { id: register.id },
			data: { [promField]: newAvg, [countField]: newCount },
		});
	}
	async incrementTiempoRespuesta(
		idUsuario: string,
		segundos: number,
		tx: Prisma.TransactionClient,
	) {
		await this.updateProm(
			tx,
			idUsuario,
			"tiempo_respuesta_prom_seg",
			"respuestas_contadas",
			segundos,
		);
	}
	async incrementPuntajeAtencion(
		idUsuario: string,
		puntaje: number,
		tx: Prisma.TransactionClient,
	) {
		await this.updateProm(
			tx,
			idUsuario,
			"puntuacion_atencion_prom",
			"evaluaciones_contadas",
			puntaje,
		);
	}
}
