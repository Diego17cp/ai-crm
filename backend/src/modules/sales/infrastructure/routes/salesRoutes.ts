import { Router } from "express";
import { PrismaSalesRepository } from "../adapters/PrismaSalesRepository";
import { SalesUseCases } from "../../application/use-cases/SalesUseCases";
import { SalesController } from "../controllers/SalesController";
import { authGuard } from "@/app/middlewares/authGuard";
import { prisma } from "@/infrastructure/database/prismaClient";
import { env } from "@/config";
import { KapsoWhatsAppService } from "@/modules/chatbot/infrastructure/adapters/KapsoWhatsAppService";
import { MetaWhatsappService } from "@/modules/chatbot/infrastructure/adapters/MetaWhatsappService";
import { ReminderSenderService } from "../../application/services/ReminderSenderService";

export function salesRoutes(): Router {
	const router = Router();
	const repository = new PrismaSalesRepository(prisma);
	let whatsappService;
	switch (env.WHATSAPP_PROVIDER?.toLowerCase()) {
		case "meta":
			whatsappService = new MetaWhatsappService();
			break;
		case "kapso":
			whatsappService = new KapsoWhatsAppService();
			break;
		default:
			throw new Error(
				`Proveedor de WhatsApp no soportado: ${env.WHATSAPP_PROVIDER}`,
			);
	}
    const reminderSender = new ReminderSenderService(whatsappService, repository);
	const useCases = new SalesUseCases(repository, reminderSender);
	const controller = new SalesController(useCases);

	router.get("/cobranzas", authGuard, controller.getCollections);
	router.get("/", authGuard, controller.getAll);
	router.get("/:id", authGuard, controller.getById);
	router.post("/", authGuard, controller.create);
	router.patch("/cuotas/:idCuota/pay", authGuard, controller.payQuota);
	router.post("/cuotas/:idCuota/recordatorios", authGuard, controller.sendDebtRemind);

	return router;
}
