import { Router } from "express";
import { MetricsUseCases } from "../../application/use-cases/MetricsUseCases";
import { prisma } from "@/infrastructure/database/prismaClient";
import { MetricsController } from "../controllers/MetricsController";
import { authGuard } from "@/app/middlewares/authGuard";

export function metricsRoutes(): Router {
  const router = Router()

  const metricsUseCases = new MetricsUseCases(prisma)
  const metricsController = new MetricsController(metricsUseCases)

  router.get("/asesor/:idUsuario", authGuard, metricsController.getAdvisorMetrics);
  router.get("/admin/resumen", authGuard, metricsController.getAdminOverview);

  return router
}