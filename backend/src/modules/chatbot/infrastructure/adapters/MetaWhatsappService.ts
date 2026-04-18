import { env } from "@/config";
import { IWhatsappService } from "../../application/ports/IWhatsappService";
import axios from "axios";

export class MetaWhatsappService implements IWhatsappService {
    private readonly baseUrl = `https://graph.facebook.com/v25.0/${env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`;
    private readonly headers = {
        Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    };
    async sendTextMessage(to: string, message: string): Promise<void> {
        try {
            await axios.post(this.baseUrl, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { preview_url: false, body: message },

            }, {
                headers: this.headers,
            });
            console.log(`[Meta] Mensaje enviado exitosamente a WhatsApp: ${to}`);
        } catch (error: any) {
            console.error(`[Meta Error] Error al mandar msj de WhatsApp a ${to}:`, error.response?.data || error.message);
            throw error;
        }
    }
    async sendTemplateMessage(to: string, templateName: string, parameters: string[]): Promise<void> {
        try {
            await axios.post(this.baseUrl, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                template: {
                    name: templateName,
                    language: { code: "es_PE" },
                    components: [{
                        type: "body",
                        parameters: parameters.map(param => ({
                            type: "text",
                            text: param,
                        }))
                    }]
                }
            }, {
                headers: this.headers,
            });
            console.log(`[Meta] Template "${templateName}" enviado exitosamente a WhatsApp: ${to}`);
        } catch (error: any) {
            console.error(`[Meta Error] Error al mandar template "${templateName}" de WhatsApp a ${to}:`, error.response?.data || error.message);
            throw error;
        }
    }
}