import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { GetDashboardDataUseCase } from "../../application/use-cases/GetDashboardDataUseCase";
import { PrismaDashboardRepository } from "../adapters/PrismaDashboardRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authGuard } from "@/app/middlewares/authGuard";

export function dashboardRoutes(): Router {
    const router = Router();
    
    const dashboardRepo = new PrismaDashboardRepository(prisma);
    const useCase = new GetDashboardDataUseCase(dashboardRepo);
    const controller = new DashboardController(useCase);    
    router.get("/", authGuard, controller.getDashboardData);
    
    return router;
}