import type { CanalContacto } from "./index";

export interface LiveChatQueueItem {
    id: string;
    nombre: string;
    canal: CanalContacto
    lastMessage: string;
    createdAt: string;
}
export interface ChatRequiresHumanEvt {
    conversacionId: string;
    message: string;
    timeStamp: string;
    info?: {
        canal: CanalContacto;
        ultimo_mensaje: string;
        cliente?: {
            nombres?: string;
            apellidos?: string;
        }
        hora_ultimo_mensaje: string;
    }
}