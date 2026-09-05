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
}

export interface IQuotePdfService {
	generate(data: QuotePdfData): Promise<Buffer>;
}
