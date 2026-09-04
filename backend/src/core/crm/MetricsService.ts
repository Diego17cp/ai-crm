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
}
