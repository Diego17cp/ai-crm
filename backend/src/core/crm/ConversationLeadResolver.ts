import { PrismaClient } from "generated/prisma/client";
import { IdentityResolverService } from "../identity/IdentityResolverService";

export class ConversationLeadResolver {
	constructor(
		private prisma: PrismaClient,
		private identityResolver: IdentityResolverService,
	) {}

	async resolveForInterestSignal(conversacionId: string): Promise<{
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
		if (conversacion.id_lead)
			return {
				leadId: conversacion.id_lead,
				esNuevo: false,
			};
		let personaId = conversacion.id_persona;
		if (!personaId) {
			if (conversacion.canal === "WHATSAPP" && conversacion.session_id) {
				const persona =
					await this.identityResolver.resolveOrCreateByPhone({
						telefono: conversacion.session_id,
					});
				personaId = persona.id;
			} else {
				const anonima = await this.prisma.personas.create({ data: {} });
				personaId = anonima.id;
			}
		}
		const lead = await this.prisma.leads.create({
			data: { id_persona: personaId, estado: "NUEVO" },
		});
		await this.prisma.conversaciones.update({
			where: { id: conversacionId },
			data: { id_persona: personaId, id_lead: lead.id },
		});
		return { leadId: lead.id, esNuevo: true };
	}
}
