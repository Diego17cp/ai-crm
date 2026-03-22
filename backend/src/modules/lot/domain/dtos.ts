import { EstadoLote } from "generated/prisma/client";

export interface CreateLoteDTO {
    id_manzana: number;
    numero_lote: string;
    numero_partida?: string;
    area_m2: number;
    precio_m2: number;
    estado?: EstadoLote;
}

export interface UpdateLoteDTO extends Partial<CreateLoteDTO> {}

export interface GetLotesQueryDTO {
    q?: string | undefined;
    page: number;
    limit: number;
    id_proyecto?: number | undefined;
    id_etapa?: number | undefined;
    id_manzana?: number | undefined;
    estado?: EstadoLote | undefined;
}

export interface PaginatedLotesResult<T> {
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