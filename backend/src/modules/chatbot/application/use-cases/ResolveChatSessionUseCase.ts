import { IChatbotRepository } from "../ports/IChatbotRepository";

export class ResolveChatSessionUseCase {
	constructor(private readonly chatRepo: IChatbotRepository) {}

	async execute(
		identifier: string,
		canal: "WEB" | "WHATSAPP",
	): Promise<string> {
		let conversacion =
			await this.chatRepo.findActiveConversationBySession(identifier);

		if (!conversacion) {
			conversacion = await this.chatRepo.createConversation(
				identifier,
				canal,
			);
		}

		return conversacion.id;
	}
}
