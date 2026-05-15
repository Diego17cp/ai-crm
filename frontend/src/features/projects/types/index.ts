export interface PaginatedMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginatedMeta;
}

export interface Manzana {
    id: number;
    id_etapa: number;
    codigo: string;
    estado: string;
    created_at: string;
}

export interface Etapa {
    id: number;
    id_proyecto: number;
    nombre: string;
    estado: string;
    created_at: string;
    manzanas: Manzana[];
}

export interface Proyecto {
    id: number;
    id_ubigeo: string;
    nombre: string;
    abreviatura: string | null;
    ubicacion: string | null;
    descripcion: string | null;
    // Es una string porque en la base de datos es un decimal, 
    // pero lo manejamos como string para evitar problemas de precisión en JS
    porcentaje_descuento: string;
    estado: string;
    created_at: string;
    updated_at: string;
    etapas: Etapa[];
    ubigeo: { nombre: string };
}