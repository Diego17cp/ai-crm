import { IChatbotRepository } from "../ports/IChatbotRepository";

export interface ResolvedSession {
	conversacionId: string;
	estado: "BOT" | "ESPERANDO_ASESOR" | "ATENDIDO_HUMANO" | "FINALIZADO";
}

export class ResolveChatSessionUseCase {
	constructor(private readonly chatRepo: IChatbotRepository) {}

	async execute(
		identifier: string,
		canal: "WEB" | "WHATSAPP",
	): Promise<ResolvedSession> {
		const exists =
			await this.chatRepo.findConversationBySession(identifier);

		if (exists) {
			if (exists.estado === "FINALIZADO") {
				await this.chatRepo.reactivateConversation(exists.id);
				return { conversacionId: exists.id, estado: "BOT" };
			}
			return { conversacionId: exists.id, estado: exists.estado };
		}
		const nueva = await this.chatRepo.createConversation(identifier, canal);
		return { conversacionId: nueva.id, estado: "BOT" };
	}
}
