import {
	ActitudCliente,
	EstadoCivil,
	SexoPersona,
	SolvenciaEconomica,
	TipoTelefono,
} from "generated/prisma/client";

export interface TelefonoDTO {
    numero: string;
    tipo: TipoTelefono;
}

export interface CreateLeadDTO {
    id_tipo_doc_identidad: number;
    id_ubigeo?: string | undefined;
    numero: string;
    nombres?: string | null | undefined;
    apellidos?: string | null | undefined;
    fecha_nacimiento?: Date | null | undefined;
    sexo?: SexoPersona | null | undefined;
    estado_civil?: EstadoCivil | null | undefined;
    es_peruano?: boolean | null | undefined;
    nacionalidad?: string | null | undefined;
    direccion?: string | null | undefined;
    email?: string | null | undefined;
    ocupacion?: string | null | undefined;
    solvencia?: SolvenciaEconomica | null | undefined;
    actitud?: ActitudCliente | null | undefined;
    telefonos?: TelefonoDTO[] | undefined;
}

export interface UpdateTelefonosPayload {
    add?: TelefonoDTO[];
    remove? : number[];
    update?: {
        id: number;
        numero?: string;
        tipo?: TipoTelefono;
    }[];
}

export interface UpdateLeadDTO extends Partial<Omit<CreateLeadDTO, "telefonos">> {
    telefonos?: UpdateTelefonosPayload;
}

export interface GetLeadsQueryDTO {
	q?: string | undefined;
	page: number;
	limit: number;
	sexo?: SexoPersona | undefined;
	es_peruano?: boolean | undefined;
	estado_civil?: EstadoCivil | undefined;
	solvencia?: SolvenciaEconomica | undefined;
	actitud?: ActitudCliente | undefined;
}

export interface PaginatedLeadsResult<T> {
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
