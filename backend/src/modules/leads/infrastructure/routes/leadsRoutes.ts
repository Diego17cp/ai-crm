import { Router } from "express";
import { LeadsController } from "../controllers/LeadsController";
import { LeadsUseCases } from "../../application/use-cases/LeadsUseCases";
import { PrismaLeadsRepository } from "../adapters/PrismaLeadsRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authGuard } from "@/app/middlewares/authGuard";
import { LeadTransitionService } from "@/core/crm/LeadTransitionService";
import { MetricsService } from "@/core/crm/MetricsService";

export function leadsRoutes(): Router {
	const router = Router();
	const metricsService = new MetricsService();
	const leadTransitionService = new LeadTransitionService(metricsService);
	const repo = new PrismaLeadsRepository(prisma);
	const useCases = new LeadsUseCases(repo, leadTransitionService, prisma);
	const controller = new LeadsController(useCases);

	router.get("/", authGuard, controller.getAll);
	router.get("/:id", authGuard, controller.getById);
	router.post("/", authGuard, controller.create);
	router.put("/:id", authGuard, controller.update);
	router.delete("/:id", authGuard, controller.delete);
	router.patch("/:leadId/estado", authGuard, controller.updateState);

	return router;
}
