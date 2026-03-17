import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserUseCases } from "../../application/use-cases/UserUseCases";
import { PrismaUserRepository } from "../adapters/PrismaUserRepository";
import { Argon2PasswordHasher } from "../adapters/Argon2PasswordHasher";
import { prisma } from "@/infrastructure/database/prismaClient";

export function userRoutes(): Router {
	const router = Router();

	const userRepository = new PrismaUserRepository(prisma);
	const passwordHasher = new Argon2PasswordHasher();
	const userUseCases = new UserUseCases(userRepository, passwordHasher);
	const userController = new UserController(userUseCases);

	router.post("/", userController.create);
	router.get("/:id", userController.getById);
	router.patch("/:id", userController.update);
	router.delete("/:id", userController.delete);

	return router;
}
