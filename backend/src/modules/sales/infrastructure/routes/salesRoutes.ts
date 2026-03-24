import { Router } from "express";
import { PrismaSalesRepository } from "../adapters/PrismaSalesRepository";
import { SalesUseCases } from "../../application/use-cases/SalesUseCases";
import { SalesController } from "../controllers/SalesController";
import { authGuard } from "@/app/middlewares/authGuard";
import { prisma } from "@/infrastructure/database/prismaClient";

export function salesRoutes(): Router {
    const router = Router();
    const repository = new PrismaSalesRepository(prisma);
    const useCases = new SalesUseCases(repository);
    const controller = new SalesController(useCases);

    router.get("/cobranzas", authGuard, controller.getCollections);
    router.get("/", authGuard, controller.getAll);
    router.get("/:id", authGuard, controller.getById);
    router.post("/", authGuard, controller.create);
    router.patch("/cuotas/:idCuota/pay", authGuard, controller.payQuota);

    return router;
}