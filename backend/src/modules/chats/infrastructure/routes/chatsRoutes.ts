import { Router } from "express";
import { PrismaChatsRepository } from "../adapters/PrismaChatsRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { ChatUseCases } from "../../application/use-cases/ChatsUseCases";
import { ChatsController } from "../controllers/ChatsController";
import { authGuard } from "@/app/middlewares/authGuard";

export function chatRoutes(): Router {
    const repo = new PrismaChatsRepository(prisma);
    const useCases = new ChatUseCases(repo);
    const controller = new ChatsController(useCases);
    const router = Router();
    router.get("/", authGuard, controller.getChats);
    router.get("/session/:sessionId", controller.getChatBySessionId);
    router.get("/:chatId", authGuard, controller.getChatById);
    router.get("/live/queue", authGuard, controller.getLiveChatQueue);
    router.get("/live/active", authGuard, controller.getLiveActiveChats);
    return router;
}