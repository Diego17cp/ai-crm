import { Router } from "express";
import { PrismaRolesRepository } from "../adapters/PrismaRolesRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { RolesUseCases } from "../../application/use-cases/RolesUseCases";
import { RolesController } from "../controllers/RolesController";
import { authGuard } from "@/app/middlewares/authGuard";

export function rolesRoutes(): Router {
    const router = Router();
    const rolesRepo = new PrismaRolesRepository(prisma);
    const rolesUseCases = new RolesUseCases(rolesRepo);
    const rolesController = new RolesController(rolesUseCases);

    router.get("/", authGuard, rolesController.getAllRoles);

    return router;
}