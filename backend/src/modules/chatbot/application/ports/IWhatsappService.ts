export interface IWhatsappService {
    sendTextMessage(to: string, message: string): Promise<void>;
    sendTemplateMessage?(to: string, templateName: string, parameters: string[]): Promise<void>;
}