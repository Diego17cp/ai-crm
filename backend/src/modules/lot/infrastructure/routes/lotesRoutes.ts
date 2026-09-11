import { Router } from "express";
import { LotesController } from "../controllers/LotesController";
import { LotesUseCases } from "../../application/use-cases/LotesUseCases";
import { PrismaLotesRepository } from "../adapters/PrismaLotesRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authGuard } from "@/app/middlewares/authGuard";
import { uploadLotesImagenesMiddleware } from "@/app/middlewares/uploadLotesImagenesMiddleware";

export function lotesRoutes(): Router {
    const router = Router();
    
    const lotesRepo = new PrismaLotesRepository(prisma);
    const lotesUseCases = new LotesUseCases(lotesRepo);
    const controller = new LotesController(lotesUseCases);

    router.get("/", authGuard, controller.getAll);
    router.get("/:id", authGuard, controller.getById);
    router.post("/", authGuard, uploadLotesImagenesMiddleware.array("imagenes", 10), controller.create);
    router.put("/:id", authGuard, controller.update);
    router.delete("/:id", authGuard, controller.delete);

    return router;
}