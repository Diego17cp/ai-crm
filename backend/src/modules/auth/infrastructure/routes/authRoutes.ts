import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthUseCases } from "../../application/use-cases/AuthUseCases";
import { PrismaAuthUserRepository } from "../adapters/PrismaAuthUserRepository";
import { JwtTokenService } from "../adapters/JwtTokenService";
import { Argon2PasswordHasher } from "../adapters/Argon2PasswordHasher";
import { prisma } from "@/infrastructure/database/prismaClient";

export function authRoutes(): Router {
	const router = Router();

	const authRepo = new PrismaAuthUserRepository(prisma);
	const tokenService = new JwtTokenService();
	const passwordHasher = new Argon2PasswordHasher();

	const authUseCases = new AuthUseCases(
		authRepo,
		passwordHasher,
		tokenService,
	);
	const authController = new AuthController(authUseCases);

	router.post("/login", authController.login);
	router.post("/refresh", authController.refresh);
	router.post("/logout", authController.logout);
	router.get("/me", authController.me);

	return router;
}
