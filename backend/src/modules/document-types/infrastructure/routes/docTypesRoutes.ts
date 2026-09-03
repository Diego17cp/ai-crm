import { Router } from "express";
import { prisma } from "@/infrastructure/database/prismaClient";
import { PrismaDocTypesRepository } from "../adapters/PrismaDocTypesRepository";
import { DocTypesUseCases } from "../../application/use-cases/DocTypesUseCases";
import { DocTypesController } from "../controllers/DocTypesController";
import { authGuard } from "@/app/middlewares/authGuard";

export function docTypesRoutes(): Router {
	const router = Router();

	const repo = new PrismaDocTypesRepository(prisma);
	const useCases = new DocTypesUseCases(repo);
	const controller = new DocTypesController(useCases);

	router.get("/", authGuard, controller.getAll);

	return router;
}
