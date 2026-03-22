export type EstadoLote = "Disponible" | "Vendido" | "Reservado";
export interface ImagenLote {
	id: number;
	es_principal: boolean;
	url_imagen: string;
}
export interface Lote {
	id: number;
	id_manzana: number;
	numero_lote: string;
	numero_partida?: string;
	area_m2: string;
	precio_m2: string;
	precio_total: string;
	estado: EstadoLote;
	created_at: string;
	imagenes: ImagenLote[];
	manzana: {
		codigo: string;
		etapa: {
			nombre: string;
			proyecto: {
				nombre: string;
			};
		};
	};
}
export interface LotesResponse {
	success: boolean;
	data: Lote[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
export interface FiltrosState {
    q?: string;
    id_proyecto?: number;
    id_etapa?: number;
    id_manzana?: number;
    estado?: EstadoLote;
    page: number;
    limit: number;
}