import { Server, Socket } from "socket.io";
import { ChatUseCases } from "../../application/use-cases/ChatsUseCases";

export class SocketChatController {
    constructor(
        private io: Server,
        private chatUseCases: ChatUseCases
    ) {}
    registerListeners(socket: Socket) {
        socket.on("client:JOIN_CHAT_ROOM", (payload: { chatId: string }) => {
            if (payload.chatId) socket.join(payload.chatId);
        });
        socket.on("client:TAKE_CHAT", async (payload: { chatId: string, asesorId: string }) => {
            try {
                await this.chatUseCases.assignChatFromQueue(payload.chatId, payload.asesorId);
                this.io.emit("server:CHAT_ASSIGNED", { chatId: payload.chatId, asesorId: payload.asesorId });
                socket.join(payload.chatId);
            } catch (error: any) {
                socket.emit("server:ERROR", {
                    message: error.message || "Error al tomar el chat",
                    code: "CHAT_TAKEN"
                })
            }
        });
        socket.on("client:SEND_MESSAGE", async (payload: { chatId: string, content: string, senderRole: "CLIENTE" | "ASESOR" | "BOT" }) => {
            try {
                await this.chatUseCases.saveLiveChatMessage(payload.chatId, payload.content, payload.senderRole);
                this.io.to(payload.chatId).emit("server:NEW_MESSAGE", {
                    chatId: payload.chatId,
                    content: payload.content,
                    role: payload.senderRole.toLowerCase(),
                })
            } catch (error: any) {
                console.error("[Websocket] Error guardando mensaje", error);
                socket.emit("server:ERROR", {
                    message: "No se pudo enviar el mensaje",
                    code: "SEND_MESSAGE_ERROR"
                });
            }
        });
    }
}