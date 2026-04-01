import { getIO } from "@/bootstrap/startWebsocket";
import { IEventNotifier } from "../../application/ports/IEventNotifier";

export class SocketEventNotifier implements IEventNotifier {
    constructor() {}

    notifyHumanAssistanceRequired(conversacionId: string, info?: any): void {
        const io = getIO();
        io.emit("server:CHAT_REQUIRES_HUMAN", {
            conversacionId,
            message: "Un usuario está solicitando comunicación con un asesor.",
            timeStamp: new Date().toISOString(),
            info,
        })
    }
}