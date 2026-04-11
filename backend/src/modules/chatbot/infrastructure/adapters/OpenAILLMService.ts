import OpenAI from "openai";
import { ILLMService, LLMMessage } from "../../application/ports/ILLMService";
import { IToolsRegistry } from "../../application/ports/IToolsRegistry";

export class OpenAILLMService implements ILLMService {
	private openai: OpenAI;

	constructor(
		apiKey: string,
		private readonly toolsRegistry: IToolsRegistry,
	) {
		this.openai = new OpenAI({ apiKey });
	}

	async chat(messages: LLMMessage[]): Promise<LLMMessage> {
		const openAIMessages: OpenAI.ChatCompletionMessageParam[] = messages.map(msg => {
			if (msg.role === "tool") return {
				role: "tool",
				content: msg.content || "",
				tool_call_id: msg.tool_call_id!,
			}
			if (msg.role === "assistant") {
				const assistantMsg: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
					role: "assistant",
					content: msg.content || null,
				};
				if (msg.tool_calls && msg.tool_calls.length > 0) {
					assistantMsg.tool_calls = msg.tool_calls.map(tc => ({
						id: tc.id,
						type: "function",
						function: {
							name: tc.name,
							arguments: typeof tc.arguments === "string" ? tc.arguments : JSON.stringify(tc.arguments),
						}
					}));
				}
				return assistantMsg;
			}
			return {
				role: msg.role,
				content: msg.content || "",
			} as OpenAI.Chat.ChatCompletionSystemMessageParam | OpenAI.Chat.ChatCompletionUserMessageParam;
		})
		const response = await this.openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: openAIMessages,
			tools: this.toolsRegistry.getToolsDefinition(),
			tool_choice: "auto",
			temperature: 0.2,
		});

		const msg = response.choices[0]?.message;
		if (!msg) throw new Error("No response from LLM");
		const resultMessage: LLMMessage = { role: "assistant" }
		if (msg.content !== null && msg.content !== undefined) resultMessage.content = msg.content;
		if (msg.tool_calls && msg.tool_calls.length > 0) {
			resultMessage.tool_calls = msg.tool_calls.map((tc: any) => ({
				id: tc.id,
				name: tc.function.name,
				arguments: JSON.parse(tc.function.arguments),
			}))
		}
		return resultMessage;
	}
}
