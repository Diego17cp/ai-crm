import { Router } from "express";
import { PrismaChatsRepository } from "../adapters/PrismaChatsRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { ChatUseCases } from "../../application/use-cases/ChatsUseCases";
import { ChatsController } from "../controllers/ChatsController";
import { authGuard } from "@/app/middlewares/authGuard";
import { MetricsService } from "@/core/crm/MetricsService";
import { LeadTransitionService } from "@/core/crm/LeadTransitionService";

export function chatRoutes(): Router {
	const repo = new PrismaChatsRepository(prisma);
	const metricsService = new MetricsService()
	const leadTransitionService = new LeadTransitionService(metricsService)
	const useCases = new ChatUseCases(repo, leadTransitionService, prisma);
	const controller = new ChatsController(useCases);
	const router = Router();
	router.get("/", authGuard, controller.getChats);
	router.get("/session/:sessionId", controller.getChatBySessionId);
	router.get("/:chatId", authGuard, controller.getChatById);
	router.get("/live/queue", authGuard, controller.getLiveChatQueue);
	router.get("/live/active", authGuard, controller.getLiveActiveChats);
	router.patch("/:chatId/status", authGuard, controller.updateChatStatus);
	router.get("/:chatId/events", controller.getChatEvents);
	router.get("/:chatId/assignments", controller.getChatAssignments);
	return router;
}
