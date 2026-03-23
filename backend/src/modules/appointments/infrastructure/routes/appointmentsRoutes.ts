import { Router } from "express";
import { PrismaAppointmentsRepository } from "../adapters/PrismaAppointmentsRepository";
import { AppointmentsUseCases } from "../../application/use-cases/AppointmentsUseCases";
import { AppointmentsController } from "../controllers/AppointmentsController";
import { authGuard } from "@/app/middlewares/authGuard";
import { prisma } from "@/infrastructure/database/prismaClient";

export function appointmentsRoutes(): Router {
    const router = Router();
    
    const repository = new PrismaAppointmentsRepository(prisma);
    const useCases = new AppointmentsUseCases(repository);
    const controller = new AppointmentsController(useCases);

    router.get("/", authGuard, controller.getAll);
    router.get("/:id", authGuard, controller.getById);
    router.post("/", authGuard, controller.create);
    router.put("/:id", authGuard, controller.update);
    router.delete("/:id", authGuard, controller.delete);

    return router;
}