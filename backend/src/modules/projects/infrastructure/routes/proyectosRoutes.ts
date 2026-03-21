import { Router } from "express";
import { ProyectosController } from "../controllers/ProyectosController";
import { ProyectosUseCases } from "../../application/use-cases/ProyectosUseCases";
import { PrismaProyectosRepository } from "../adapters/PrismaProyectosRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authGuard } from "@/app/middlewares/authGuard";

export function proyectosRoutes(): Router {
    const router = Router();
    
    const proyectosRepo = new PrismaProyectosRepository(prisma);
    const proyectosUseCases = new ProyectosUseCases(proyectosRepo);
    const controller = new ProyectosController(proyectosUseCases);

    router.get("/", authGuard, controller.getAll);
    router.post("/", authGuard, controller.create);
    router.put("/:id", authGuard, controller.update);
    router.delete("/:id", authGuard, controller.delete);

    router.post("/:id_proyecto/etapas", authGuard, controller.createEtapa);
    router.put("/etapas/:id", authGuard, controller.updateEtapa);
    router.delete("/etapas/:id", authGuard, controller.deleteEtapa);

    router.post("/etapas/:id_etapa/manzanas", authGuard, controller.createManzana);
    router.post("/etapas/:id_etapa/manzanas/batch", authGuard, controller.createManzanasBatch);
    router.put("/manzanas/:id", authGuard, controller.updateManzana);
    router.delete("/manzanas/:id", authGuard, controller.deleteManzana);

    return router;
}