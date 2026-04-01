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

export function createChatbotRouter(): Router {
	const router = Router();

	const chatbotRepo = new PrismaChatbotRepository(prisma);

	const eventNotifier = new SocketEventNotifier();

	const toolsRegistry = new ChatToolsRegistry(prisma, eventNotifier);
	// const llmService = new OpenAILLMService(
	// 	env.OPENAI_API_KEY,
	// 	toolsRegistry,
	// );
    const llmService = new GeminiLLMService(
        env.GEMINI_API_KEY,
        toolsRegistry,
    )
	const processChatMessage = new ProcessChatMessageUseCase(
		llmService,
		toolsRegistry,
		chatbotRepo,
	);
    const resolveChatSessionUseCase = new ResolveChatSessionUseCase(chatbotRepo);
	const chatbotController = new ChatbotController(processChatMessage, resolveChatSessionUseCase);
	router.post("/message", chatbotController.handleMessage);
	return router;
}
