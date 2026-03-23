import type { Actitud, CreateLeadPayload, Solvencia, Telefono } from "@/features/leads/types";
import type { Lote } from "@/features/lots/types";

export type EstadoCita = 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA';

export interface Cliente {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefonos: Telefono[];
    sexo: 'M' | 'F' | null;
    es_peruano: boolean | null;
    nacionalidad: string | null;
    direccion: string | null;
    numero: string;
    solvencia: Solvencia | null;
    actitud: Actitud | null;
}
export interface Asesor {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string | null;
    rol: {
        nombre: string
    }
}
export interface Proyecto {
    id: number;
    nombre: string;
    abreviatura: string;
    ubicacion: string;
    descripcion: string | null;
}
export interface Cita {
    id: number;
    id_cliente: number | null;
    id_proyecto: number;
    id_lote: number | null;
    id_usuario_responsable: string;
    fecha_cita: string;
    hora_cita: string | null;
    observaciones_visita: string | null;
    puntuacion_cliente: number | null;
    estado_cita: EstadoCita;
    created_at: string;
    updated_at: string;
    cliente?: Cliente | null;
    asesor?: Asesor | null;
    proyecto?: Proyecto | null;
    lote?: Lote | null;
}
export interface AppointmentsResponse {
    data: Cita[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export interface FiltersState {
    page: number;
    limit: number;
    estado_cita?: EstadoCita;
    fecha_inicio?: string;
    fecha_fin?: string;
    puntuacion?: number;
    id_proyecto?: number;
    id_usuario_responsable?: string;
}
export interface EditAppointmentPayload {
    id_proyecto?: number;
    id_lote?: number | null;
    id_usuario_responsable?: string;
    fecha_cita?: string;
    hora_cita?: string;
    observaciones_visita?: string | null;
    puntuacion_cliente?: number | null;
    estado_cita?: EstadoCita;
}

export interface CreateAppointmentPayload {
    id_cliente?: number;
    nuevo_cliente?: CreateLeadPayload;
    id_proyecto: number;
    id_lote?: number | null;
    id_usuario_responsable: string;
    fecha_cita: string;
    hora_cita: string;
    observaciones_visita?: string | null;
}