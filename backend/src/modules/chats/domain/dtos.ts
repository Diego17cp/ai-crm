import { CanalContacto, EstadoChat, TipoRemitente } from "generated/prisma/enums";

export interface ChatMessageDTO {
    id: number;
    usuario: {
        id: string;
        nombres: string;
        apellidos: string;
        rol: {
            id: number;
            nombre: string;
        }
    } | null;
    remitente: TipoRemitente | null;
    created_at: Date;
    contenido: string | null;
};
export interface ChatDTO {
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
        rol: {
            id: number;
            nombre: string;
        }
    } | null;
    mensajes: ChatMessageDTO[];
    created_at: Date;
    estado: EstadoChat;
    canal: CanalContacto | null;
}
export interface GetChatsQueryDTO {
    q?: string | undefined;
    estado?: EstadoChat | undefined;
    canal?: CanalContacto | undefined;
    page: number;
    limit: number;
}
export interface PaginatedChatResults<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
}
export interface LiveChatQueueItemDTO {
    id: string;
    nombre: string;
    canal: CanalContacto | null;
    lastMessage: string | null;
    createdAt: Date;
}