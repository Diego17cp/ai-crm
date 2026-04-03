import { env } from "@/config";
import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";

export class KapsoWhatsAppService {
    private readonly kapsoClient: WhatsAppClient;
    constructor() {
        this.kapsoClient = new WhatsAppClient({
            kapsoApiKey: env.KAPSO_API_KEY,
            baseUrl: 'https://api.kapso.ai/meta/whatsapp',
        });
    }
    async sendTextMessage(to: string, message: string) {
        try {
            await this.kapsoClient.messages.sendText({
                phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
                to,
                body: message,
            });
            console.log(`[Kapso] Mensaje enviado exitosamente a WhatsApp: ${to}`);
        } catch (error: any) {
            console.error(`[Kapso Error] Error al mandar msj de WhatsApp a ${to}:`, error.message);
            throw error;
        }
    }
}