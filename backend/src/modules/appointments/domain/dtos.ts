import { EstadoCita } from "generated/prisma/client";
import { CreateLeadDTO } from "../../leads/domain/dtos";

export interface CreateAppointmentDTO {
    id_cliente?: number;
    nuevo_cliente?: CreateLeadDTO;
    id_proyecto: number;
    id_lote?: number | null;
    id_usuario_responsable: string;
    fecha_cita: Date | string;
    hora_cita: Date | string;
    observaciones_visita?: string | null;
}

export interface UpdateAppointmentDTO {
    id_proyecto?: number;
    id_lote?: number | null;
    id_usuario_responsable?: string;
    fecha_cita?: Date | string;
    hora_cita?: Date | string;
    observaciones_visita?: string | null;
    puntuacion_cliente?: number | null;
    estado_cita?: EstadoCita;
}

export interface GetAppointmentsQueryDTO {
    page: number;
    limit: number;
    estado_cita?: EstadoCita | undefined;
    fecha_inicio?: Date | string | undefined;
    fecha_fin?: Date | string | undefined;
    puntuacion?: number | undefined;
    id_proyecto?: number | undefined;
    id_usuario_responsable?: string | undefined;
}

export interface PaginatedAppointmentsResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}