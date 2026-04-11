import { Router } from "express";
import { ChatbotController } from "../controllers/ChatbotController";
import { ProcessChatMessageUseCase } from "../../application/use-cases/ProcessChatMessageUseCase";
import { ChatToolsRegistry } from "../adapters/ChatToolsRegistry";
// import { OpenAILLMService } from "../adapters/OpenAILLMService";
import { PrismaChatbotRepository } from "../adapters/PrismaChatbotRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { env } from "@/config";
import { ResolveChatSessionUseCase } from "../../application/use-cases/ResolveChatSessionUseCase";
import { GeminiLLMService } from "../adapters/GeminiLLMService";
import { SocketEventNotifier } from "../adapters/SocketEventNotifier";
import { KapsoWhatsAppService } from "../adapters/KapsoWhatsAppService";
import { WhatsappWebhookController } from "../controllers/WhatsappWebhookController";
import { OpenAILLMService } from "../adapters/OpenAILLMService";

export function createChatbotRouter(): Router {
	const router = Router();

	const chatbotRepo = new PrismaChatbotRepository(prisma);

	const eventNotifier = new SocketEventNotifier();

	const toolsRegistry = new ChatToolsRegistry(prisma, eventNotifier);

	let llmService = null;

	switch (env.AI_MODEL_PROVIDER.toLowerCase()) {
		case "gemini":
			llmService = new GeminiLLMService(
				env.GEMINI_API_KEY,
				toolsRegistry,
			);
			break;
		case "openai":
			llmService = new OpenAILLMService(
				env.OPENAI_API_KEY,
				toolsRegistry
			);
			break;
		default:
			throw new Error(`Proveedor de modelo AI no soportado: ${env.AI_MODEL_PROVIDER}`);
	}
	console.log(`Usando proveedor de modelo AI: ${env.AI_MODEL_PROVIDER}`);
	const processChatMessage = new ProcessChatMessageUseCase(
		llmService,
		toolsRegistry,
		chatbotRepo,
	);
	
    const resolveChatSessionUseCase = new ResolveChatSessionUseCase(chatbotRepo);
	const chatbotController = new ChatbotController(processChatMessage, resolveChatSessionUseCase);
	
	const kapsoService = new KapsoWhatsAppService();
	const whatsappWebhookController = new WhatsappWebhookController(
		kapsoService,
		processChatMessage,
		resolveChatSessionUseCase,
		chatbotRepo
	)
	router.post("/message", chatbotController.handleMessage);
	router.post("/webhook/whatsapp", whatsappWebhookController.handleWebhookEvent);
	router.get("/webhook/whatsapp", whatsappWebhookController.verifyWebook);
	return router;
}
