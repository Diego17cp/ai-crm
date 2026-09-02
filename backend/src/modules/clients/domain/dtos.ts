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

export interface CreateClientDTO {
	// Identity fields
	id_tipo_doc_identidad: number;
	numero: string;
	nombres?: string | null;
	apellidos?: string | null;
	fecha_nacimiento?: Date | null;
	sexo?: SexoPersona | null;
	estado_civil?: EstadoCivil | null;
	es_peruano?: boolean | null;
	nacionalidad?: string | null;
	direccion?: string | null;
	email?: string | null;
	ocupacion?: string | null;
	id_ubigeo?: string | null;
	telefonos?: TelefonoDTO[];

	// Client fields
	solvencia?: SolvenciaEconomica | null;
	actitud?: ActitudCliente | null;
}

export interface UpdateTelefonosPayload {
	add?: TelefonoDTO[];
	remove?: number[];
	update?: {
		id: number;
		numero?: string;
		tipo?: TipoTelefono;
	}[];
}

export interface UpdateClientDTO extends Partial<
	Omit<CreateClientDTO, "telefonos">
> {
	telefonos?: UpdateTelefonosPayload;
}

export interface GetClientsQueryDTO {
	q?: string;
	page: number;
	limit: number;
	sexo?: SexoPersona;
	es_peruano?: boolean;
	estado_civil?: EstadoCivil;
	solvencia?: SolvenciaEconomica;
	actitud?: ActitudCliente;
}

export interface PaginatedClientsResult<T> {
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
