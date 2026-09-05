import { ToolAttachment } from "../chat/ToolAttachment";

export interface DeliverDocumentInput {
	conversationId: string;
	title: string;
	url: string;
	filename: string;
	whatsappTemplateName: string;
	whatsappTemplateParams: string[];
}

export interface DeliverDocumentResult {
	deliveredByWhatsapp: boolean;
	attachment?: ToolAttachment;
	error?: string;
}

export interface IDocumentDeliveryService {
	deliver(input: DeliverDocumentInput): Promise<DeliverDocumentResult>;
}
