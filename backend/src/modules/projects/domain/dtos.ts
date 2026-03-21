import { EstadoGeneral } from "generated/prisma/client";

export interface CreateProyectoDTO {
	id_ubigeo: string;
	nombre: string;
	abreviatura?: string;
	ubicacion?: string;
	descripcion?: string;
}

export interface UpdateProyectoDTO extends Partial<CreateProyectoDTO> {
	estado?: EstadoGeneral;
}

export interface CreateEtapaDTO {
	id_proyecto: number;
	nombre: string;
}

export interface UpdateEtapaDTO {
	nombre?: string;
	estado?: EstadoGeneral;
}

export interface CreateManzanaDTO {
	id_etapa: number;
	codigo: string;
}

export interface UpdateManzanaDTO {
	codigo?: string;
	estado?: EstadoGeneral;
}

export interface GetProyectosQueryDTO {
    q?: string | undefined;
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
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
