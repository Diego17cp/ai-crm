export interface QuoteDetail {
	id: number;
	codigo: string;
	cliente: string;
	proyecto: string;
	lote: string;
	area_m2: number;
	precio_lista: number;
	descuento: number;
	precio_final: number;
	cuota_inicial?: number;
	numero_cuotas?: number;
	monto_cuota?: number;
	motivo_revision: string;
	estado: "BORRADOR" | "EMITIDA" | "ACEPTADA" | "RECHAZADA" | "VENCIDA";
	requiere_revision: boolean;
	id_revisor: string | null;
	asesor: { nombres: string; apellidos: string | null } | null;
	revisor: { nombres: string; apellidos: string | null } | null;
	pdf_url: string | null;
	generado_por: GeneradoPor;
	created_at: string;
	id_conversacion: string | null
}

export type GeneradoPor = "BOT" | "ASESOR";
export type EstadoCotizacion =
	| "BORRADOR"
	| "EMITIDA"
	| "ACEPTADA"
	| "RECHAZADA"
	| "VENCIDA";

export interface QuoteFilters {
	q?: string;
	state?: EstadoCotizacion;
	date?: string;
	generatedBy?: GeneradoPor;
	page: number;
	limit: number;
	userId?: string;
}

export interface Quote {
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
	created_at: string;
	estado: EstadoCotizacion;
	generado_por: GeneradoPor;
}
export interface AllQuotesResponse {
	success: boolean;
	data: Quote[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
export interface CreateQuotePayload {
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
