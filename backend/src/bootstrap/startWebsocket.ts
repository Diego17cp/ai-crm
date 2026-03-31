import { env } from "@/config";
import { Server } from "node:http";
import { Server as IOServer } from "socket.io";

export const startWebsocket = (server: Server) => {
    const io = new IOServer(server, {
        path: "/api/socker.io",
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
    // TODO: aqui va el registro de eventos del websocket
}