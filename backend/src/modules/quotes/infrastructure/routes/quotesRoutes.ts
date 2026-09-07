import { Router } from "express";
import { PrismaQuoteRepository } from "../adapters/PrismaQuoteRepository";
import { QuoteUseCases } from "../../application/use-cases/QuoteUseCases";
import { QuotesController } from "../controllers/QuotesController";
import { prisma } from "@/infrastructure/database/prismaClient";
import { PdfKitQuotePdfService } from "@/infrastructure/pdf/PdfKitQuotePdfService";
import { DocumentDeliveryService } from "@/infrastructure/documents/DocumentDeliveryService";
import { env } from "@/config";
import { KapsoWhatsAppService } from "@/modules/chatbot/infrastructure/adapters/KapsoWhatsAppService";
import { MetaWhatsappService } from "@/modules/chatbot/infrastructure/adapters/MetaWhatsappService";
import { PrismaChatbotRepository } from "@/modules/chatbot/infrastructure/adapters/PrismaChatbotRepository";
import { MetricsService } from "@/core/crm/MetricsService";
import { SocketEventNotifier } from "@/modules/chatbot/infrastructure/adapters/SocketEventNotifier";
import { authGuard } from "@/app/middlewares/authGuard";
import { IdentityResolverService } from "@/core/identity/IdentityResolverService";

export function quotesRoutes(): Router {
	const repo = new PrismaQuoteRepository(prisma);
	const chatbotRepo = new PrismaChatbotRepository(prisma);
	const pdfService = new PdfKitQuotePdfService();
	const metrics = new MetricsService();
	const notifier = new SocketEventNotifier();
	const identityService = new IdentityResolverService(prisma)
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
				`[Websockets] Proveedor de WhatsApp no soportado: ${env.WHATSAPP_PROVIDER}`,
			);
	}
	const deliver = new DocumentDeliveryService(prisma, whatsappService);
	const useCases = new QuoteUseCases(
		prisma,
		repo,
		pdfService,
		deliver,
		chatbotRepo,
		metrics,
		notifier,
		identityService,
		whatsappService
	);
	const controller = new QuotesController(useCases);
	const router = Router();
	router.get("/", controller.getQuotes);
	router.post("/", authGuard, controller.createManualQuote);
	router.get("/queue", controller.getPendingQueue);
	router.get("/mine", controller.getMyReviews);
	router.get("/:quoteId", controller.getQuoteById);
	return router;
}
