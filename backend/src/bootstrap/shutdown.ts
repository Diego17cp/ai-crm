import { prisma } from "@/infrastructure/database/prismaClient";
import { Server } from "node:http";

export const setupShutdown = (server: Server) => {
    const shutdown = async () => {
        console.info('Shutting down server...');
        await prisma.$disconnect();
        server.close(() => {
            console.info('Server closed successfully.');
            process.exit(0);
        })
    }
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}