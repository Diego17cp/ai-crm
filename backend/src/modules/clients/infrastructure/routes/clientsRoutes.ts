import { Router } from "express";
import { ClientsController } from "../controllers/ClientsController";
import { ClientsUseCases } from "../../application/use-cases/ClientsUseCases";
import { PrismaClientsRepository } from "../adapters/PrismaClientsRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authGuard } from "@/app/middlewares/authGuard";

export function clientsRoutes(): Router {
    const router = Router();
    
    const repo = new PrismaClientsRepository(prisma);
    const useCases = new ClientsUseCases(repo);
    const controller = new ClientsController(useCases);

    router.get("/", authGuard, controller.getAll);
    router.get("/:id", authGuard, controller.getById);
    router.post("/", authGuard, controller.create);
    router.put("/:id", authGuard, controller.update);
    router.delete("/:id", authGuard, controller.delete);

    return router;
};
