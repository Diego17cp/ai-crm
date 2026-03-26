import type { Telefono } from "@/features/leads/types";
import type { EstadoLote } from "@/features/lots/types";

export type TipoPago = "CONTADO" | "CREDITO";
export type EstadoVenta = "PENDIENTE" | "FINALIZADA" | "ANULADO";
export type EstadoContrato =
	| "ADENDA"
	| "POR RESOLVER"
	| "ESCRITURA PUBLICA"
	| "FIRMADO"
	| "CESION CONTRACTUAL";
export type EstadoCuota = "PENDIENTE" | "PAGADO";
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "DEPOSITO";
export interface LoteVenta {
	numero_lote: string;
	numero_partida: string | null;
	area_m2: string;
	precio_m2: string;
	precio_total: string;
	estado: EstadoLote;
	manzana: {
		codigo: string;
		etapa: {
			nombre: string;
			proyecto: {
				nombre: string;
				abreviatura: string;
				ubicacion: string;
			};
		};
	};
}

export interface Venta {
	id: number;
	fecha_venta: string;
	monto_total: string;
	cuota_inicial: string | null;
	tipo_pago: TipoPago;
	num_cuotas: number | null;
	monto_cuota: string | null;
	tasa_interes: string | null;
	dia_pago: number | null;
	meses_gracia: number | null;
	estado: EstadoVenta;
	estado_contrato: EstadoContrato;
	cliente: {
		nombres: string;
		apellidos: string;
		numero: string; // Es el documento de identidad
		email: string;
	};
	lote: LoteVenta;
	cuotas_pendientes: number;
}

export interface AllSalesResponse {
	success: boolean;
	data: Venta[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface AllSalesFilters {
	page: number;
	limit: number;
	estado_venta?: EstadoVenta;
	estado_contrato?: EstadoContrato;
	tipo_pago?: TipoPago;
	q?: string;
	fecha_inicio?: string;
	fecha_fin?: string;
}

export interface CreateSalePayload {
	id_lote: number;
	id_cliente: number;
	fecha_venta?: string;
	monto_total: number;
	tipo_pago: TipoPago;
	cuota_inicial?: number;
	num_cuotas?: number;
	dia_pago?: number;
	meses_gracia?: number;
	estado_contrato?: EstadoContrato;
}

export interface VentaById {
	id: number;
	fecha_venta: string;
	monto_total: string;
	cuota_inicial: string | null;
	tipo_pago: TipoPago;
	num_cuotas: number | null;
	monto_cuota: string | null;
	tasa_interes: string | null;
	dia_pago: number | null;
	meses_gracia: number | null;
	estado: EstadoVenta;
	estado_contrato: EstadoContrato;
	cliente: {
		nombres: string;
		apellidos: string;
		numero: string; // Es el documento de identidad
		fecha_nacimiento: string;
		sexo: string;
		email: string;
		es_peruano: boolean;
		nacionalidad: string | null;
	};
	lote: LoteVenta;
    cuotas: {
        id: number;
        numero_cuota: number;
        monto_cuota: string;
        fecha_vencimiento: string;
        fecha_pago: string | null;
        estado: EstadoCuota;
        metodo_pago: string | null;
    }[];
}
export interface VentaByIdResponse {
    success: boolean;
    data: VentaById;
}
interface VentaWithClienteWithTelefonos extends Omit<Venta, 'cliente'> {
	cliente: Venta['cliente'] & { telefonos: Telefono[] };
}
export interface Cobro {
	id: number;
	id_venta: number;
	numero_cuota: number;
	monto_cuota: string;
	fecha_vencimiento: string;
	fecha_pago: string | null;
	estado: EstadoCuota;
	metodo_pago: MetodoPago | null;
	venta: VentaWithClienteWithTelefonos;
	dias_mora: number | null;
}
export interface CobrosResponse {
	success: boolean;
	data: Cobro[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	}
}
export interface CollectionsBoardFilters {
	page: number;
	limit: number;
	filtro?: "vencidas" | "proximas" | "todas";
	dias_proximas?: number;
}