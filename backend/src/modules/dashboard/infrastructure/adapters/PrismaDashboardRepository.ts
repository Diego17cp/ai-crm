import { PrismaClient } from "generated/prisma/client";
import { IDashboardRepository } from "../../application/ports/IDashboardRepository";
import { DashboardStats, AppointmentEvent } from "../../domain/Dashboard";

export class PrismaDashboardRepository implements IDashboardRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async getStats(): Promise<DashboardStats> {
        const [leads, clients, soldLots, availableLots] = await Promise.all([
            this.prisma.clientes.count({ where: { tipo_persona: "LEAD" } }),
            this.prisma.clientes.count({ where: { tipo_persona: "CLIENTE" } }),
            this.prisma.lotes.count({ where: { estado: "Vendido" } }),
            this.prisma.lotes.count({ where: { estado: "Disponible" } }),
        ]);

        return { leads, clients, soldLots, availableLots };
    }

    async getRecentEvents(): Promise<AppointmentEvent[]> {
        const citas = await this.prisma.citas.findMany({
            include: {
                cliente: true,
                proyecto: true,
                lote: true,
            },
            where: {
                estado_cita: { in: ["PROGRAMADA", "ATENDIDA"] },
            },
            take: 20, 
            orderBy: { fecha_cita: "asc" }
        });

        return citas.map(cita => {
            const dateStr = cita.fecha_cita.toISOString().split("T")[0];
            const startTime = cita.hora_cita 
                ? (cita.hora_cita.toISOString().split("T")[1] || "10:00:00").substring(0,8) 
                : "10:00:00";
            
            return {
                id: cita.id.toString(),
                title: `Cita c/ ${cita.cliente.nombres || ''} ${cita.cliente.apellidos || cita.cliente.numero} - Proyecto ${cita.proyecto.nombre}`,
                start: `${dateStr}T${startTime}.000Z`,
                allDay: !cita.hora_cita,
                backgroundColor: cita.estado_cita === "PROGRAMADA" ? "#2563eb" : "#0d9488",
            };
        });
    }
}