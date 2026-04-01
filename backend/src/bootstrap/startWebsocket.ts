import { env } from "@/config";
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
    ioInstance.on("connection", (socket) => {
        console.log("[Websocket] Cliente conectado:", socket.id);
        socket.on("disconnect", () => {
            console.log("[Websocket] Cliente desconectado:", socket.id);
        });
        // TODO: Aqui va el registro de listeners entrantes si es necesario
    })
}
export const getIO = (): IOServer => {
    if (!ioInstance) throw new Error("Socket.io no está inicializado");
    return ioInstance;
}