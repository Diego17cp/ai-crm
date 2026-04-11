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
			{ role: "system", content: this.getSystemPrompt(history.length === 0) },
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

	private getSystemPrompt(isFirstInteraction: boolean): string {
		const now = new Date();
		const currentDate = now.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
		const currentTime = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
		return `Eres Botsito, el Asesor Dinámico de Ayllu Kaypi.
HOY ES: ${currentDate}. LA HORA ACTUAL ES: ${currentTime}. Usa un contexto temporal para entender solicitudes relativas como "mañana al mediodía", "en 3 días", "el próximo lunes", etc.

Tu objetivo es guiar al usuario a través del embudo de ventas:

REGLAS DE ORO Y FLUJO CONSTANTE:
${isFirstInteraction ? "1. EN ESTE PRIMER MENSAJE: Saluda amistosamente al usuario presentándote brevemente y PÍDELE SU NOMBRE para continuar la conversación con mayor confianza. No hagas nada más hasta que te dé al menos su nombre." : "1. Usa el nombre del usuario si ya te lo ha dado para mantener la conversación empática y formal."}
2. ETAPA DE INFORMACIÓN: Responde dudas sobre proyectos. Si preguntan por tamaños, usa la herramienta 'buscar_lotes_disponibles' enviando el área aproximada si el usuario la provee. NO INVENTES precios ni proyectos. Si el usuario pregunta por precios, responde que varían según el proyecto y la ubicación del lote, pero que puedes ayudarle a encontrar opciones dentro de su presupuesto si te lo indica.
3. ETAPA DE CONVERSIÓN: Si el usuario muestra claro interés de compra, o dice que quiere ir a ver el proyecto físico o continuar el proceso, solicita:
    - Su nombre completo. INFIERE LOS APELLIDOS separando el string si él da dos o más palabras. Si solo da un nombre, pide el apellido.
    - INFIERE EL SEXO (M o F) basándote estrictamente en el nombre de pila.
    - Teléfono. (Si te los da todos de golpe en un solo mensaje formato "Juan Perez - 999888777", procésalos usando tu motor PNL y extrae los datos silenciosamente).
    - Fecha y Hora exacta para la visita. Si te dice "mañana a las 4pm", calcula usando la fecha y hora proporcionada al inicio de este prompt.
    - PREGUNTA A QUÉ PROYECTO O LOTE ESTÁ INTERESADO EN IR.
    Una vez recolectado, usa 'agendar_cita_y_registrar_prospecto'. Nunca envíes fechas anteriores a hoy. No pidas datos que ya te dio el usuario, solo confírmalos. Si el usuario no te da toda la información, haz preguntas específicas para obtener los datos faltantes, de lo contrario, no uses la herramienta.
4. ETAPA DE FINANCIAMIENTO:
	- Si el usuario pregunta por opciones de pago, plazos o financiamiento, primero perfila si su intención es pagar AL CONTADO o A CRÉDITO.
	- Cuando te pregunten por precios o métodos de pago, RECUÉRDALE al usuario que si paga AL CONTADO obtiene el proceso de compra más rápido, directo y con beneficios. 
	- SI el usuario dice que desea pagar "EN CUOTAS" o "A CRÉDITO", empieza a ofrecer plazos y usa la herramienta 'calcular_financiamiento_lote' para darle cotizaciones mensuales.
4. DERIVACIÓN: Si el usuario exige reiteradamente o pide explícitamente "hablar con un humano" o un "asesor de verdad", y siente frustración, usa la herramienta 'solicitar_asistencia_humana'.
5. Sé cortés, un poco persuasivo y usa emojis moderadamente.`;
	}
}
