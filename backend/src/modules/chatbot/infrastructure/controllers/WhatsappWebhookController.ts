import { NextFunction, Request, Response } from "express";
import { IChatbotRepository } from "../../application/ports/IChatbotRepository";
import { ProcessChatMessageUseCase } from "../../application/use-cases/ProcessChatMessageUseCase";
import { ResolveChatSessionUseCase } from "../../application/use-cases/ResolveChatSessionUseCase";
import { KapsoWhatsAppService } from "../adapters/KapsoWhatsAppService";
import { env } from "@/config";
import { markdownToWhatsappText } from "../utils/formatter";
import { getIO } from "@/bootstrap/startWebsocket";

export class WhatsappWebhookController {
    constructor(
        private readonly kapsoService: KapsoWhatsAppService,
        private readonly processChatMessageUseCase: ProcessChatMessageUseCase,
        private readonly resolveChatSessionUseCase: ResolveChatSessionUseCase,
        private readonly chatbotRepo: IChatbotRepository
    ){}

    verifyWebook = (req: Request, res: Response) => {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode && token) {
            if (mode === "subscribe" && token === env.WEBHOOK_VERIFY_TOKEN) {
                console.log("[Kapso] Webhook de WhatsApp verificado exitosamente!");
                return res.status(200).send(challenge);
            }
            return res.status(403).send("Token de verificación incorrecto");
        }
        return res.status(400).send("Faltan parámetros de verificación");
    }
    handleWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
        console.log("[Kapso] Body recibido:", JSON.stringify(req.body, null, 2));
        try {
            const body = req.body;
            if (body && body.message && body.message.kapso?.direction === "inbound") {
                const message = body.message;
                if (message.type === "text" && message.text) {
                    const from = message.from;
                    const text = message.text.body;
                    const chatId = await this.resolveChatSessionUseCase.execute(from, "WHATSAPP");
                    const chat = await this.chatbotRepo.findChatById(chatId);
                    const isBotActive = chat?.estado === "BOT";
                    if (isBotActive) {
                        const response = await this.processChatMessageUseCase.execute(chatId, text);
                        const formattedResponse = markdownToWhatsappText(response);
                        await this.kapsoService.sendTextMessage(from, formattedResponse);
                    } else {
                        await this.chatbotRepo.saveMessage(chatId, "HUMANO", text);
                        const io = getIO();
                        io.to(chatId).emit("server:NEW_MESSAGE", {
                            chatId,
                            content: text,
                            role: "cliente"
                        })
                    }
                }
            }
            return res.sendStatus(200);
        } catch (error) {
            console.error("[Kapso] Fallo en la recepción del webhook:", error);
            return next(error);
        }
    }
}