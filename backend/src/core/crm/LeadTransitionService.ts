import { Prisma } from "generated/prisma/client";
import { EstadoLead } from "generated/prisma/enums";
import { AppError } from "../errors/AppError";
import { LEAD_TRANSITIONS } from "./lead-transitions";
import { MetricsService } from "./MetricsService";

interface TransitionParams {
	leadId: number;
	nuevoEstado: EstadoLead;
	idUsuario?: string | undefined;
	motivo?: string | undefined;
	tx: Prisma.TransactionClient;
}

export class LeadTransitionService {
	constructor(private metrics: MetricsService) {}

	async transition(params: TransitionParams): Promise<void> {
		const { leadId, nuevoEstado, idUsuario, motivo, tx } = params;

		const lead = await tx.leads.findUnique({ where: { id: leadId } });
		if (!lead) throw new AppError("Lead no encontrado", 404);
		const permitido = LEAD_TRANSITIONS[lead.estado].includes(nuevoEstado);
		if (!permitido)
			throw new AppError(
				`Transición de ${lead.estado} a ${nuevoEstado} no permitida`,
				400,
			);

		await tx.leads.update({
			where: { id: leadId },
			data: {
				estado: nuevoEstado,
				...(nuevoEstado === "GANADO" || nuevoEstado === "PERDIDO"
					? { fecha_cierre: new Date() }
					: {}),
				...(nuevoEstado === "CONTACTADO"
					? { fecha_contacto: new Date() }
					: {}),
				...(nuevoEstado === "CALIFICADO"
					? { fecha_calificacion: new Date() }
					: {}),
			},
		});
		await tx.historialEstadoLead.create({
			data: {
				id_lead: leadId,
				estado_anterior: lead.estado,
				estado_nuevo: nuevoEstado,
				id_usuario: idUsuario ?? null,
				motivo: motivo ?? null,
			},
		});
		await this.metrics.onLeadTransition(lead, nuevoEstado, idUsuario, tx);
	}
}
