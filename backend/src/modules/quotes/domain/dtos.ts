import {
	Cotizaciones,
	Etapas,
	Lotes,
	Manzanas,
	Personas,
	Proyectos,
} from "generated/prisma/client";

export type QuoteWithRelations = Cotizaciones & {
	persona: Personas;
	lote: Lotes & {
		manzana: Manzanas & {
			etapa: Etapas & {
				proyecto: Proyectos;
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
	estado: "BORRADOR" | "EMITIDA" | "ACEPTADA" | "RECHAZADA" | "VENCIDA";
	requiere_revision: boolean;
	id_revisor: string | null;
	created_at: Date;
}