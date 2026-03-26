export type TipoTelefono = "PERSONAL" | "TRABAJO" | "WHATSAPP";
export interface Telefono { 
    id: number;
    numero: string;
    tipo: TipoTelefono;
}
export interface TipoDoc {
    id: number;
    nombre: string;
}
export interface Ubigeo {
    id: string;
    nombre: string;
}
export interface Lead {
    id: number;
    id_tipo_doc_identidad: number;
    id_ubigeo: string | null;
    numero: string;
    nombres: string | null;
    apellidos: string | null;
    fecha_nacimiento: string | null;
    sexo: 'M' | 'F' | null;
    estado_civil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'CONVIVIENTE' | null;
    es_peruano: boolean | null;
    nacionalidad: string | null;
    direccion: string | null;
    email: string | null;
    ocupacion: string | null;
    solvencia: 'DESCARTADO' | 'MOROSO' | 'PAGA ATRASADO' | 'BUEN_PAGADOR' | 'EXCELENTE' | null;
    actitud: 'QUEJOSO' | 'ENOJADO' | 'DESCONFIADO' | 'AMABLE' | null;
    created_at: string;
    updated_at: string;
    tipo_doc: TipoDoc;
    ubigeo: Ubigeo | null;
    telefonos: Telefono[];
}
export interface LeadsResponse {
    success: boolean;
    data: Lead[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};
export type Sexo = 'M' | 'F';
export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'CONVIVIENTE';
export type Solvencia = 'DESCARTADO' | 'MOROSO' | 'PAGA ATRASADO' | 'BUEN_PAGADOR' | 'EXCELENTE';
export type Actitud = 'QUEJOSO' | 'ENOJADO' | 'DESCONFIADO' | 'AMABLE';

export interface FiltersState {
    sexo?: Sexo;
    estado_civil?: EstadoCivil;
    es_peruano?: boolean;
    solvencia?: Solvencia;
    actitud?: Actitud;
    q?: string;
    page: number;
    limit: number;
}

export interface CreateLeadPayload {
    id_tipo_doc_identidad: number;
    id_ubigeo?: string;
    numero: string;
    nombres?: string;
    apellidos?: string;
    fecha_nacimiento?: string;
    sexo?: Sexo;
    estado_civil?: EstadoCivil;
    es_peruano?: boolean;
    nacionalidad?: string;
    direccion?: string;
    email?: string;
    ocupacion?: string;
    solvencia?: Solvencia;
    actitud?: Actitud;
    telefonos?: {
        numero: string;
        tipo: TipoTelefono;
    }[];
}
export interface UpdateLeadPayload extends Partial<Omit<CreateLeadPayload, "telefonos">> {
    telefonos?: {
        add?: {
            numero: string;
            tipo: TipoTelefono;
        }[];
        remove?: number[];
        update?: {
            id: number;
            numero?: string;
            tipo?: TipoTelefono;
        }[];
    }
}