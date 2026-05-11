import { env } from "@/config";
import { prisma } from "@/infrastructure/database/prismaClient";
import { KapsoWhatsAppService } from "@/modules/chatbot/infrastructure/adapters/KapsoWhatsAppService";
import { MetaWhatsappService } from "@/modules/chatbot/infrastructure/adapters/MetaWhatsappService";
import { ChatUseCases } from "@/modules/chats/application/use-cases/ChatsUseCases";
import { PrismaChatsRepository } from "@/modules/chats/infrastructure/adapters/PrismaChatsRepository";
import { SocketChatController } from "@/modules/chats/infrastructure/controllers/SocketChatController";
import { Server } from "node:http";
import { Server as IOServer } from "socket.io";

let ioInstance: IOServer | null = null;

export const startWebsocket = (server: Server) => {
    ioInstance = new IOServer(server, {
        path: "/api/socket.io",
        cors: {
            origin: env.FRONTEND_URL,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 1e6,
        allowEIO3: true,
        transports: ["websocket", "polling"],
    });
    let whatsappService;
    switch (env.WHATSAPP_PROVIDER?.toLowerCase()) {
        case "meta":
            whatsappService = new MetaWhatsappService();
            break;
        case "kapso":
            whatsappService = new KapsoWhatsAppService();
            break;
        default:
            throw new Error(`[Websockets] Proveedor de WhatsApp no soportado: ${env.WHATSAPP_PROVIDER}`);
    }
    const chatsRepo = new PrismaChatsRepository(prisma);
    const chatsUseCase = new ChatUseCases(chatsRepo);
    const socketController = new SocketChatController(ioInstance, chatsUseCase, whatsappService);

    ioInstance.on("connection", (socket) => {
        console.log("[Websocket] Cliente conectado:", socket.id);
        socketController.registerListeners(socket);
        socket.on("disconnect", () => {
            console.log("[Websocket] Cliente desconectado:", socket.id);
        });
    })
}
export const getIO = (): IOServer => {
    if (!ioInstance) throw new Error("Socket.io no está inicializado");
    return ioInstance;
}