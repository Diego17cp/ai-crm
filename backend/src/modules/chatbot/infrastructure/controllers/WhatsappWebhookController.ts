import { NextFunction, Request, Response } from "express";
import { IChatbotRepository } from "../../application/ports/IChatbotRepository";
import { ProcessChatMessageUseCase } from "../../application/use-cases/ProcessChatMessageUseCase";
import { ResolveChatSessionUseCase } from "../../application/use-cases/ResolveChatSessionUseCase";
import { env } from "@/config";
import { markdownToWhatsappText } from "../utils/formatter";
import { getIO } from "@/bootstrap/startWebsocket";
import { IWhatsappService } from "../../application/ports/IWhatsappService";

export interface NormalizedMessage {
    from: string;
    text: string;
    wamid: string;
}

export class WhatsappWebhookController {
    constructor(
        private readonly whatsappService: IWhatsappService,
        private readonly processChatMessageUseCase: ProcessChatMessageUseCase,
        private readonly resolveChatSessionUseCase: ResolveChatSessionUseCase,
        private readonly chatbotRepo: IChatbotRepository,
    ){}

    private readonly whatsappProvider = env.WHATSAPP_PROVIDER?.toLowerCase() || "meta";
    private readonly processedWamids = new Set<string>();
    private readonly verifyToken = this.whatsappProvider === "meta" ? env.META_VERIFY_TOKEN : env.WEBHOOK_VERIFY_TOKEN;

    private extractMessage(body: any): NormalizedMessage | null {
        // Formato esperado de Kapso:
        if (body?.message?.kapso?.direction === "inbound") {
            const msg = body.message;
            if (msg.type === "text" && msg.text?.body) return {
                from: msg.from,
                text: msg.text.body,
                wamid: msg.id,
            }
            return null;
        }
        // Formato esperado de Meta:
        const value = body?.entry?.[0]?.changes?.[0]?.value;
        if (value?.messages?.[0]) {
            const msg = value.messages[0];
            if (value.statuses) return null; // Ignorar eventos de estado
            if (msg.type === "text" && msg.text?.body) return {
                from: msg.from,
                text: msg.text.body,
                wamid: msg.id,
            }
            return null;
        }
        return null;
    }

    verifyWebook = (req: Request, res: Response) => {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode && token) {
            if (mode === "subscribe" && token === this.verifyToken) {
                console.log("[Whatsapp] Webhook verificado exitosamente");
                return res.status(200).send(challenge);
            }
            return res.status(403).send("Token de verificación incorrecto");
        }
        return res.status(400).send("Faltan parámetros de verificación");
    }
    handleWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
        // console.log("[Whatsapp] Body recibido:", JSON.stringify(req.body, null, 2));
        try {
            const extracted = this.extractMessage(req.body);
            if (!extracted) return res.sendStatus(200); // Ignorar eventos que no sean mensajes de texto entrantes
            const { from, text, wamid } = extracted;
            if (this.processedWamids.has(wamid)) {
                console.log(`[Whatsapp] Evento con WAMID ${wamid} ya procesado, ignorando...`);
                return res.sendStatus(200);
            }
            this.processedWamids.add(wamid);
            if (this.processedWamids.size > 1000) {
                const oldestWamid = this.processedWamids.values().next().value;
                if (typeof oldestWamid === "string") this.processedWamids.delete(oldestWamid);
            }
            const chatId = await this.resolveChatSessionUseCase.execute(from, "WHATSAPP");
            const chat = await this.chatbotRepo.findChatById(chatId);
            const isBotActive = chat?.estado === "BOT";
            if (isBotActive) {
                const response = await this.processChatMessageUseCase.execute(chatId, text);
                const formattedResponse = markdownToWhatsappText(response);
                await this.whatsappService.sendTextMessage(from, formattedResponse);
            } else {
                await this.chatbotRepo.saveMessage(chatId, "HUMANO", text);
                const io = getIO();
                io.to(chatId).emit("server:NEW_MESSAGE", {
                    chatId,
                    content: text,
                    role: "cliente"
                })
            }
            return res.sendStatus(200);
        } catch (error) {
            console.error("[Whatsapp] Fallo en la recepción del webhook:", error);
            return next(error);
        }
    }
}