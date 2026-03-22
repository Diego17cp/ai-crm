import { Router } from "express";
import { LeadsController } from "../controllers/LeadsController";
import { LeadsUseCases } from "../../application/use-cases/LeadsUseCases";
import { PrismaLeadsRepository } from "../adapters/PrismaLeadsRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authGuard } from "@/app/middlewares/authGuard";

export function leadsRoutes(): Router {
    const router = Router();
    
    const repo = new PrismaLeadsRepository(prisma);
    const useCases = new LeadsUseCases(repo);
    const controller = new LeadsController(useCases);

    router.get("/", authGuard, controller.getAll);
    router.get("/:id", authGuard, controller.getById);
    router.post("/", authGuard, controller.create);
    router.put("/:id", authGuard, controller.update);
    router.delete("/:id", authGuard, controller.delete);

    return router;
}