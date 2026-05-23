export interface IWhatsappService {
    sendTextMessage(to: string, message: string): Promise<void>;
    sendTemplateMessage?(to: string, templateName: string, parameters: string[], languageCode?: string): Promise<void>;
    sendDocumentTemplate?(to: string, templateName: string, documentUrl: string, filename: string, bodyTexts: string[], languageCode?: string): Promise<void>;
}