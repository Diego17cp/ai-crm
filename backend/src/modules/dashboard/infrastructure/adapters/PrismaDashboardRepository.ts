import { PrismaClient } from "generated/prisma/client";
import { IDashboardRepository } from "../../application/ports/IDashboardRepository";
import { DashboardStats, AppointmentEvent } from "../../domain/Dashboard";

export class PrismaDashboardRepository implements IDashboardRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getStats(idAsesor?: string): Promise<DashboardStats> {
		const [leads, clients, soldLots, availableLots] = await Promise.all([
			this.prisma.leads.count({
				where: {
					estado: { notIn: ["GANADO", "PERDIDO"] },
					...(idAsesor ? { id_asesor: idAsesor } : {}),
				},
			}),
			idAsesor
				? this.prisma.ventas
						.findMany({
							where: { id_asesor: idAsesor },
							select: { id_cliente: true },
							distinct: ["id_cliente"],
						})
						.then((v) => v.length)
				: this.prisma.clientes.count(),
			this.prisma.lotes.count({ where: { estado: "Vendido" } }),
			this.prisma.lotes.count({ where: { estado: "Disponible" } }),
		]);

		return { leads, clients, soldLots, availableLots };
	}

	async getRecentEvents(idAsesor?: string): Promise<AppointmentEvent[]> {
		const citas = await this.prisma.citas.findMany({
			include: {
				persona: {
					select: {
						nombres: true,
						apellidos: true,
						numero: true,
						telefonos: true,
					},
				},
				proyecto: true,
				lote: true,
			},
			where: {
				estado_cita: { in: ["PROGRAMADA", "ATENDIDA"] },
				...(idAsesor ? { id_usuario_responsable: idAsesor } : {}),
			},
			take: 20,
			orderBy: { fecha_cita: "asc" },
		});

		return citas.map((cita) => {
			const dateStr = cita.fecha_cita.toISOString().split("T")[0];
			const startTime = cita.hora_cita
				? (
						cita.hora_cita.toISOString().split("T")[1] || "10:00:00"
					).substring(0, 8)
				: "10:00:00";

			const nombreCliente = cita.persona.nombres
				? `${cita.persona.nombres} ${cita.persona.apellidos ?? ""}`.trim()
				: cita.persona.numero || "Cliente anónimo";

			return {
				id: cita.id.toString(),
				title: `Cita c/ ${nombreCliente} - Proyecto ${cita.proyecto.nombre}`,
				start: `${dateStr}T${startTime}.000Z`,
				allDay: !cita.hora_cita,
				backgroundColor:
					cita.estado_cita === "PROGRAMADA" ? "#2563eb" : "#0d9488",
				client_number: cita.persona.telefonos[0]?.numero || "N/A",
			};
		});
	}
}
