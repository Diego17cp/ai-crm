import type { EstadoCivil, Person, Sexo, TipoTelefono } from "@/core/types";

export type EstadoLead =
	| "NUEVO"
	| "CONTACTADO"
	| "CALIFICADO"
	| "INTERESADO"
	| "CITA_AGENDADA"
	| "NEGOCIACION"
	| "GANADO"
	| "PERDIDO";
export interface Lead {
	id: number;
	id_persona: number;
	estado: EstadoLead;
	motivo_perdida: string | null;
	fecha_contacto: string | null;
	fecha_calificacion: string | null;
	fecha_cierre: string | null;
	persona: Person;
	created_at: string;
	updated_at: string;
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
}

export interface FiltersState {
	sexo?: Sexo;
	estado_civil?: EstadoCivil;
	es_peruano?: boolean;
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
	telefonos?: {
		numero: string;
		tipo: TipoTelefono;
	}[];
}
export interface UpdateLeadPayload extends Partial<
	Omit<CreateLeadPayload, "telefonos">
> {
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
	};
}
