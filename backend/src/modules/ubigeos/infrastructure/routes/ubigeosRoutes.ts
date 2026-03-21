import { Router } from "express";
import { PrismaUbigeosRepository } from "../adapters/PrismaUbigeosRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { UbigeosUseCases } from "../../application/use-cases/UbigeosUseCases";
import { UbigeosController } from "../controllers/UbigeosController";

export function ubigeosRoutes(): Router {
    const router = Router();
    const ubigeosRepo = new PrismaUbigeosRepository(prisma);
    const ubigeosUseCases = new UbigeosUseCases(ubigeosRepo);
    const ubigeosController = new UbigeosController(ubigeosUseCases);
    router.get("/", ubigeosController.getAll);
    return router;
}