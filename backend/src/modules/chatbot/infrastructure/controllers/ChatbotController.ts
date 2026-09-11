import { Request, Response, NextFunction } from "express";
import { ProcessChatMessageUseCase } from "../../application/use-cases/ProcessChatMessageUseCase";
import { ResolveChatSessionUseCase } from "../../application/use-cases/ResolveChatSessionUseCase";
import { IChatbotRepository } from "../../application/ports/IChatbotRepository";
import { getIO } from "@/bootstrap/startWebsocket";
import { pickRespuestaEnEspera } from "@/core/chat/waitingResponses";

const COOLDOWN_AVISO_ESPERA_MS = 60_000;
export class ChatbotController {
	constructor(
		private readonly processChatMessageUseCase: ProcessChatMessageUseCase,
		private readonly resolveChatSessionUseCase: ResolveChatSessionUseCase,
		private readonly chatbotRepo: IChatbotRepository,
	) {}

	handleMessage = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { identifier, canal, mensaje } = req.body;

			if (!identifier || !canal || !mensaje) {
				return res.status(400).json({
					success: false,
					message:
						"Los campos 'identifier', 'canal' y 'mensaje' son obligatorios",
				});
			}
			const { conversacionId, estado } =
				await this.resolveChatSessionUseCase.execute(
					identifier,
					canal as "WEB" | "WHATSAPP",
				);
			if (estado !== "BOT") {
				await this.chatbotRepo.saveMessage(
					conversacionId,
					"HUMANO",
					mensaje,
				);
				const io = getIO();
				io.to(conversacionId).emit("server:NEW_MESSAGE", {
					chatId: conversacionId,
					content: mensaje,
					role: "cliente",
				});
				const ultimoAvisoBot =
					await this.chatbotRepo.findLastBotMessage(conversacionId); // 🔧
				const debeAvisar =
					!ultimoAvisoBot ||
					Date.now() - (ultimoAvisoBot.created_at?.getTime() ?? 0) >
						COOLDOWN_AVISO_ESPERA_MS;

				if (debeAvisar) {
					const respuesta = pickRespuestaEnEspera(
						estado as "ESPERANDO_ASESOR" | "ATENDIDO_HUMANO",
					);
					await this.chatbotRepo.saveMessage(
						conversacionId,
						"BOT",
						respuesta,
					);
					return res
						.status(200)
						.json({ success: true, data: { respuesta } });
				}

				return res
					.status(200)
					.json({ success: true, data: { respuesta: null } });
			}
			const { respuesta, adjuntos } =
				await this.processChatMessageUseCase.execute(
					conversacionId,
					mensaje,
				);
			return res.status(200).json({
				success: true,
				data: {
					respuesta,
					adjuntos,
				},
			});
		} catch (error) {
			return next(error);
		}
	};
}
