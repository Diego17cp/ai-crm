import {
	Cotizaciones,
	Etapas,
	Lotes,
	LotesImagenes,
	Manzanas,
	Personas,
	Proyectos,
	Ubigeos,
	Usuarios,
} from "generated/prisma/client";

export type QuoteState =
	| "BORRADOR"
	| "EMITIDA"
	| "ACEPTADA"
	| "RECHAZADA"
	| "VENCIDA";
export type QuoteGeneratedBy = "BOT" | "ASESOR";

export type QuoteWithRelations = Cotizaciones & {
	persona: Personas;
	asesor: Usuarios | null;
	revisor: Usuarios | null;
	lote: Lotes & {
		imagenes?: LotesImagenes[];
		manzana: Manzanas & {
			etapa: Etapas & {
				proyecto: Proyectos & {
					ubigeo?: Ubigeos | null;
				};
			};
		};
	};
};

export interface QuoteQueueItemDTO {
	id: number;
	codigo: string;
	cliente: string;
	proyecto: string;
	lote: string;
	precio_final: number;
	motivo_revision: string;
	createdAt: string;
}

export interface QuoteDetailDTO {
	id: number;
	codigo: string;
	cliente: string;
	proyecto: string;
	lote: string;
	area_m2: number;
	precio_lista: number;
	descuento: number;
	precio_final: number;
	cuota_inicial?: number | undefined;
	numero_cuotas?: number | undefined;
	monto_cuota?: number | undefined;
	motivo_revision: string;
	estado: QuoteState;
	requiere_revision: boolean;
	id_revisor: string | null;
	asesor: {
		nombres: string;
		apellidos: string | null;
	} | null;
	revisor: {
		nombres: string;
		apellidos: string | null;
	} | null;
	pdf_url: string | null;
	generado_por: QuoteGeneratedBy;
	created_at: Date;
	id_conversacion: string | null;
}

export interface QuoteDTO {
	id: number;
	codigo: string;
	cliente: {
		id: number;
		nombres: string | null;
		apellidos: string | null;
	} | null;
	asesor: {
		id: string;
		nombres: string | null;
		apellidos: string | null;
	} | null;
	revisor: {
		id: string;
		nombres: string | null;
		apellidos: string | null;
	} | null;
	precio_final: number;
	created_at: Date;
	estado: QuoteState;
	generado_por: QuoteGeneratedBy;
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

export interface GetQuotesQueryDTO {
	q?: string | undefined;
	estado?: QuoteState | undefined;
	generado_por?: QuoteGeneratedBy | undefined;
	id_usuario?: string | undefined;
	page: number;
	limit: number;
}

export interface CreateManualQuoteDTO {
	id_tipo_doc: number;
	documento_identidad: string;
	nombres?: string;
	apellidos?: string;
	telefono?: string;
	email?: string;
	id_lote: number;
	id_lead?: number;
	tipo_pago: "CONTADO" | "CREDITO";
	meses?: number;
	cuota_inicial_deseada?: number;
	descuento_solicitado?: number;
}
