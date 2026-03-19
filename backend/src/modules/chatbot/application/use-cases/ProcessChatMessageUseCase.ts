import { ILLMService, LLMMessage } from "../ports/ILLMService";
import { IToolsRegistry } from "../ports/IToolsRegistry";
import { IChatbotRepository, ChatMessage } from "../ports/IChatbotRepository";

export class ProcessChatMessageUseCase {
	constructor(
		private readonly llmService: ILLMService,
		private readonly toolsRegistry: IToolsRegistry,
		private readonly chatRepo: IChatbotRepository,
	) {}

	async execute(conversacionId: string, userInput: string): Promise<string> {
		const history =
			await this.chatRepo.getMessagesByConversation(conversacionId);
		const messages: LLMMessage[] = [
			{ role: "system", content: this.getSystemPrompt() },
			...history.map((msg: ChatMessage) => ({
				role: (msg.remitente === "HUMANO" ? "user" : "assistant") as
					| "user"
					| "assistant",
				content: msg.contenido,
			})),
			{ role: "user", content: userInput },
		];

		await this.chatRepo.saveMessage(conversacionId, "HUMANO", userInput);

		while (true) {
			const llmResponse = await this.llmService.chat(messages);
			messages.push(llmResponse);

			if (llmResponse.tool_calls && llmResponse.tool_calls.length > 0) {
				for (const toolCall of llmResponse.tool_calls) {
					const toolResult = await this.toolsRegistry.executeTool(
						toolCall.name,
						toolCall.arguments,
						conversacionId,
					);
					messages.push({
						role: "tool",
						tool_call_id: toolCall.id,
						content: JSON.stringify(toolResult),
					});
				}
				continue;
			}

			const finalResponse =
				llmResponse.content ||
				"Lo siento, no pude procesar tu solicitud adecuadamente.";
			await this.chatRepo.saveMessage(
				conversacionId,
				"BOT",
				finalResponse,
			);
			return finalResponse;
		}
	}

	private getSystemPrompt(): string {
		return `Eres Botsito, el Asesor Dinámico de Ventas de inmobiliaria.
Tu objetivo es guiar al usuario a través del embudo de ventas:

1. ETAPA DE INFORMACIÓN: Responde dudas sobre proyectos, manzanas y lotes disponibles y sus precios usando tus herramientas.
2. ETAPA DE FINANCIAMIENTO:
	- Cuando te pregunten por precios o métodos de pago, RECUÉRDALE al usuario que si paga AL CONTADO obtiene el proceso de compra más rápido, directo y con beneficios. 
	- SI el usuario dice que desea pagar "EN CUOTAS" o "A CRÉDITO", empieza a ofrecer plazos y usa la herramienta 'calcular_financiamiento_lote' para darle cotizaciones mensuales.
3. ETAPA DE CONVERSIÓN (CRÍTICO): Si el usuario muestra claro interés de compra, o dice que quiere ir a ver el proyecto físico o continuar el proceso, DEBES pedirle su Nombre, su Teléfono y qué día le gustaría visitarnos. 
Una vez que te dé esos 3 datos (o al menos nombre y teléfono para reservar intención), usa INMEDIATAMENTE la herramienta 'agendar_cita_y_registrar_prospecto' para guardarlo en el sistema.

REGLAS DE ORO:
- Trata siempre de perfilar si el pago será AL CONTADO o A CRÉDITO.
- NO INVENTES precios ni proyectos.
- NUNCA uses la herramienta 'agendar_cita_y_registrar_prospecto' sin antes haberle pedido explícitamente su nombre y teléfono en la conversación.
- Sé cortés, un poco persuasivo y usa emojis moderadamente.`;
	}
}
