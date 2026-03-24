import {
	EstadoVenta,
	EstadoContrato,
	TipoPago,
	MetodoPago,
} from "generated/prisma/client";

export interface CreateSaleDTO {
	id_lote: number;
	id_cliente: number;
	fecha_venta?: Date | string;
	monto_total: number;
	tipo_pago: TipoPago;
	cuota_inicial?: number;
	num_cuotas?: number;
	dia_pago?: number;
	meses_gracia?: number;
	estado_contrato?: EstadoContrato;
    tasa_interes?: number;
}

export interface PayQuotaDTO {
	metodo_pago: MetodoPago;
	// TODO: recibir comprobante fisico (File) para generar URL s3/local
}

export interface GetSalesQueryDTO {
	page: number;
	limit: number;
	estado_venta?: EstadoVenta;
	estado_contrato?: EstadoContrato;
	tipo_pago?: TipoPago;
	q?: string;
	fecha_inicio?: string;
	fecha_fin?: string;
}

export interface GetCollectionsQueryDTO {
	page: number;
	limit: number;
	filtro?: "vencidas" | "proximas" | "todas";
	dias_proximas?: number;
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
