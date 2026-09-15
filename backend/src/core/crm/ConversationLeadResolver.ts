import { PrismaClient } from "generated/prisma/client";
import { IdentityResolverService } from "../identity/IdentityResolverService";

export class ConversationLeadResolver {
	constructor(
		private prisma: PrismaClient,
		private identityResolver: IdentityResolverService,
	) {}

	async resolveForInterestSignal(
		conversacionId: string,
		nombre?: string,
	): Promise<{
		leadId: number;
		esNuevo: boolean;
	} | null> {
		const conversacion = await this.prisma.conversaciones.findUnique({
			where: { id: conversacionId },
			select: {
				id_lead: true,
				id_persona: true,
				canal: true,
				session_id: true,
			},
		});
		if (!conversacion) return null;
		if (conversacion.id_lead) {
			const cached = await this.prisma.leads.findUnique({
				where: { id: conversacion.id_lead },
				select: { id: true, estado: true },
			});
			if (
				cached &&
				cached.estado !== "GANADO" &&
				cached.estado !== "PERDIDO"
			) {
				return { leadId: cached.id, esNuevo: false };
			}
		}
		let personaId = conversacion.id_persona;
		if (!personaId) {
			if (conversacion.canal === "WHATSAPP" && conversacion.session_id) {
				const persona =
					await this.identityResolver.resolveOrCreateByPhone({
						telefono: conversacion.session_id,
						nombres: nombre,
					});
				personaId = persona.id;
			} else {
				const anonima =
					await this.identityResolver.resolveOrCreateGuest({
						nombres: nombre,
					});
				personaId = anonima.id;
			}
		}
		const lead = await this.resolveActiveLeadForPersona(personaId);
		await this.prisma.conversaciones.update({
			where: { id: conversacionId },
			data: { id_persona: personaId, id_lead: lead.id },
		});
		return { leadId: lead.id, esNuevo: true };
	}
	async resolveActiveLeadForPersona(
		personaId: number,
	): Promise<{ id: number }> {
		const activo = await this.prisma.leads.findFirst({
			where: {
				id_persona: personaId,
				estado: { notIn: ["GANADO", "PERDIDO"] },
			},
		});
		if (activo) return { id: activo.id };

		return this.prisma.leads.create({
			data: { id_persona: personaId, estado: "NUEVO" },
		});
	}
}
