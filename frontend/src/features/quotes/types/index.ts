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
	created_at: string;
}