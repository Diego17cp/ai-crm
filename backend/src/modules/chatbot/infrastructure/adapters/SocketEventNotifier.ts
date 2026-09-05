import { getIO } from "@/bootstrap/startWebsocket";
import {
	IEventNotifier,
	QuoteReviewRequiredInfo,
} from "../../application/ports/IEventNotifier";
import { ToolAttachment } from "@/core/chat/ToolAttachment";

export class SocketEventNotifier implements IEventNotifier {
	constructor() {}

	notifyHumanAssistanceRequired(conversacionId: string, info?: any): void {
		const io = getIO();
		io.emit("server:CHAT_REQUIRES_HUMAN", {
			conversacionId,
			message: "Un usuario está solicitando comunicación con un asesor.",
			timeStamp: new Date().toISOString(),
			info,
		});
	}

	notifyQuoteReviewRequired(info: QuoteReviewRequiredInfo): void {
		const io = getIO();
		io.emit("server:QUOTE_REQUIRES_REVIEW", {
			message: `Cotización ${info.codigo} requiere revisión antes de enviarse.`,
			timeStamp: new Date().toISOString(),
			info,
		});
	}

	notifyQuoteApprovedForClient(
		conversacionId: string,
		mensaje: string,
		attachment?: ToolAttachment,
	): void {
		const io = getIO();
		io.to(conversacionId).emit("server:NEW_MESSAGE", {
			chatId: conversacionId,
			content: mensaje,
			role: "bot",
			attachment,
		});
	}
}
