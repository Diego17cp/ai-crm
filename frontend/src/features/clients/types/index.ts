import type { Person, TipoTelefono } from "@/core/types";
import type { CreateLeadPayload } from "@/features/leads/types";

export type Solvencia =
	| "DESCARTADO"
	| "MOROSO"
	| "PAGA ATRASADO"
	| "BUEN_PAGADOR"
	| "EXCELENTE";
export type Actitud = "QUEJOSO" | "ENOJADO" | "DESCONFIADO" | "AMABLE";

export interface Client {
	id: number;
	id_persona: number;
	solvencia: Solvencia;
	actitud: Actitud;
	persona: Person;
	created_at: string;
	updated_at: string;
}

export interface ClientResponse {
	success: boolean;
	data: Client[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
export interface UpdateClientPayload extends Partial<
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
	solvencia?: Solvencia;
	actitud?: Actitud;
}
