export interface ToolAttachment {
	type: "document";
	title: string;
	url: string;
	filename: string;
	available_preview: boolean;
}

export interface ToolExecutionResult {
	[key: string]: any;
	_attachment?: ToolAttachment;
}
