export interface ToolCall {
	id: string;
	name: string;
	arguments: any;
}

export interface LLMMessage {
	role: "system" | "user" | "assistant" | "tool";
	content?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

export interface ILLMService {
	chat(messages: LLMMessage[]): Promise<LLMMessage>;
}
