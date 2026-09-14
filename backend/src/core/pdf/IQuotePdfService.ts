export interface QuotePdfImage {
	url: string
	esPrincipal?: boolean
	descripcion?: string | null
}

export interface QuotePdfData {
	codigo: string;
	clienteNombre: string;
	proyectoNombre: string;
	loteIdentificador: string;
	areaM2: number;
	precioLista: number;
	descuentoPorcentaje: number;
	precioFinal: number;
	tipoPago: "CONTADO" | "CREDITO";
	cuotaInicial?: number | undefined;
	numeroCuotas?: number | undefined;
	montoCuota?: number | undefined;

	ubicacionProyecto?: string | null | undefined;
	ubigeoProyecto?: string | null | undefined;
	referenciaLote?: string | null | undefined;
	partidaRegistral?: string | null | undefined;
	imagenesLote?: QuotePdfImage[] | undefined;
	fechaEmision?: Date | string | undefined;
}

export interface IQuotePdfService {
	generate(data: QuotePdfData): Promise<Buffer>;
}
