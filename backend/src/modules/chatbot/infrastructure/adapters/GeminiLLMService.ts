import {
	GoogleGenerativeAI,
	FunctionDeclaration,
	Tool,
} from "@google/generative-ai";
import { ILLMService, LLMMessage } from "../../application/ports/ILLMService";
import { IToolsRegistry } from "../../application/ports/IToolsRegistry";

export class GeminiLLMService implements ILLMService {
	private genAI: GoogleGenerativeAI;

	constructor(
		apiKey: string,
		private readonly toolsRegistry: IToolsRegistry,
	) {
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async chat(messages: LLMMessage[]): Promise<LLMMessage> {
		const openAiTools = this.toolsRegistry.getToolsDefinition();
		const geminiTools: Tool[] = [
			{
				functionDeclarations: openAiTools.map((t: any) => ({
					name: t.function.name,
					description: t.function.description,
					parameters: t.function.parameters,
				})) as FunctionDeclaration[],
			},
		];
		const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
		const model = this.genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			systemInstruction: systemPrompt,
			tools: geminiTools,
		});
		const historyData: any[] = [];
		for (const msg of messages.filter((m) => m.role !== "system")) {
			if (msg.role === "user") {
				historyData.push({
					role: "user",
					parts: [{ text: msg.content || "" }],
				});
			} else if (msg.role === "assistant") {
                const parts: any[] = [];
                if (msg.content && msg.content.trim() !== "") parts.push({ text: msg.content });
				if (msg.tool_calls && msg.tool_calls.length > 0) {
                    parts.push(...msg.tool_calls.map((tc) => ({
                        functionCall: { name: tc.name, args: tc.arguments },
                    })));
                }
                if (parts.length > 0) historyData.push({ role: "model", parts });
                else historyData.push({ role: "model", parts: [{ text: "Procesando información..." }]});
			} else if (msg.role === "tool") {
				const functionName = this.findToolNameById(
					messages,
					msg.tool_call_id!,
				);
                let parsedResponse = JSON.parse(msg.content || "{}");
                if (Array.isArray(parsedResponse)) parsedResponse = { results: parsedResponse };
                else if (typeof parsedResponse !== "object" || parsedResponse === null) parsedResponse = { result: parsedResponse };
				historyData.push({
					role: "function",
					parts: [
						{
							functionResponse: {
								name: functionName,
								response: parsedResponse,
							},
						},
					],
				});
			}
		}
		const lastMessage = historyData.pop();
        if (!lastMessage || !lastMessage.parts || lastMessage.parts.length === 0) throw new Error("No se pudo procesar el mensaje del usuario");
		const chat = model.startChat({ history: historyData });
		const result = await chat.sendMessage(lastMessage!.parts);
		const response = result.response;

		const resultMessage: LLMMessage = { role: "assistant" };

		const functionCalls = response.functionCalls();
		if (functionCalls && functionCalls.length > 0) {
			resultMessage.tool_calls = functionCalls.map((fc, idx) => ({
				id: `gemini_call_${Date.now()}_${idx}`,
				name: fc.name,
				arguments: fc.args,
			}));
		}
        const text = response.text();
        if (text && text.trim() !== "") resultMessage.content = text;
		return resultMessage;
	}
	private findToolNameById(messages: LLMMessage[], id: string): string {
		for (const msg of messages) {
			if (msg.tool_calls) {
				const tc = msg.tool_calls.find((t) => t.id === id);
				if (tc) return tc.name;
			}
		}
		return "unknown_function";
	}
}
