export interface IToolsRegistry {
	executeTool(name: string, args: any, conversationId?: string): Promise<any>;
	getToolsDefinition(): any[];
}
