import {
	EstadoCivil,
	SexoPersona,
	TipoTelefono,
	EstadoLead,
} from "generated/prisma/client";

export interface TelefonoDTO {
	numero: string;
	tipo: TipoTelefono;
}

export interface CreateLeadDTO {
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

	// Lead fields
	id_asesor?: string | null;
	id_proyecto?: number | null;
	estado?: EstadoLead;
	origen?: string | null;
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

export interface UpdateLeadDTO extends Partial<
	Omit<CreateLeadDTO, "telefonos">
> {
	telefonos?: UpdateTelefonosPayload;
	motivo_perdida?: string | null;
	fecha_contacto?: Date | null;
	fecha_calificacion?: Date | null;
	fecha_cierre?: Date | null;
}

export interface GetLeadsQueryDTO {
	q?: string;
	page: number;
	limit: number;
	sexo?: SexoPersona;
	es_peruano?: boolean;
	estado_civil?: EstadoCivil;
	estado?: EstadoLead;
	id_asesor?: string;
	id_proyecto?: number;
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
