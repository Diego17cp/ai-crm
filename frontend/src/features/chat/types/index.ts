export type EstadoChat = "BOT" | "ESPERANDO_ASESOR" | "ATENDIDO_HUMANO" | "FINALIZADO"
export type CanalContacto = "WHATSAPP" | "WEB"
export type TipoRemitente = "HUMANO" | "BOT"

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
}
export interface ChatDetails extends Chat {
    mensajes: ChatMessage[];
}
export interface ChatFilters {
    q?: string;
    estado?: EstadoChat;
    canal?: CanalContacto;
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
    }
}
export interface ChatDetailsResponse {
    success: boolean;
    data: ChatDetails;
}