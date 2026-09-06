import type { ToolAttachment } from "@/shared/types";

export type EstadoChat =
	| "BOT"
	| "ESPERANDO_ASESOR"
	| "ATENDIDO_HUMANO"
	| "FINALIZADO";
export type CanalContacto = "WHATSAPP" | "WEB";
export type TipoRemitente = "HUMANO" | "BOT";

export interface Chat {
	id: string;
	cliente: {
		id: number;
		nombres: string | null;
		apellidos: string | null;
	} | null;
	asesor: {
		id: string;
		nombres: string | null;
		apellidos: string | null;
	} | null;
	created_at: string;
	last_message_at: string | null;
	estado: EstadoChat;
	canal: CanalContacto | null;
}
export interface ChatMessage {
	id: number;
	usuario: {
		id: string;
		nombres: string;
		apellidos: string;
	} | null;
	remitente: TipoRemitente | null;
	created_at: string;
	contenido: string;
	adjunto?: ToolAttachment[] | null;
}
export interface ChatDetails extends Chat {
	mensajes: ChatMessage[];
}
export interface ChatFilters {
	q?: string;
	estado?: EstadoChat;
	canal?: CanalContacto;
	userId?: string;
	page: number;
	limit: number;
}
export interface AllChatsResponse {
	success: boolean;
	data: Chat[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
export interface ChatDetailsResponse {
	success: boolean;
	data: ChatDetails;
}
export type ChatStatus =
	| "BOT"
	| "ESPERANDO_ASESOR"
	| "ATENDIDO_HUMANO"
	| "FINALIZADO";

export type EventChatType =
	| "FINALIZADA"
	| "INICIADA"
	| "MENSAJE_RECIBIDO"
	| "MENSAJE_ENVIADO"
	| "BOT_RESPONDE"
	| "TRANSFERIDA_A_HUMANO"
	| "ASESOR_ASIGNADO"
	| "CITA_CREADA"
	| "COTIZACION_CREADA";
export interface EventChat {
	id: number;
	tipo: EventChatType;
	usuario: {
		id: string;
		nombres: string | null;
		apellidos: string | null;
	} | null;
	metadata: Record<string, unknown> | null;
	created_at: string;
}
export interface AsignacionDTO {
	id: number;
	usuario: { id: string; nombres: string | null; apellidos: string | null };
	fecha_inicio: Date;
	fecha_fin: Date | null;
	motivo: string | null;
}
export interface Assignment {
	id: number;
	usuario: { id: string; nombres: string | null; apellidos: string | null };
	fecha_inicio: string;
	fecha_fin: string | null;
	motivo: string | null;
}
