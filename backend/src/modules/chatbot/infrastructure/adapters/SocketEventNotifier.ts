import { getIO } from "@/bootstrap/startWebsocket";
import { IEventNotifier, QuoteReviewRequiredInfo } from "../../application/ports/IEventNotifier";

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
			info
		})
	}
}
