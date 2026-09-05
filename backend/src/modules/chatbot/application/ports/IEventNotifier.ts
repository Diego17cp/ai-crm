export interface QuoteReviewRequiredInfo {
	id_cotizacion: number;
	codigo: string;
	cliente: {
		nombres: string | null;
		apellidos: string | null;
	};
	proyecto: string;
	lote: string;
	motivo_revision: string;
	precio_final: number;
}

export interface IEventNotifier {
	notifyHumanAssistanceRequired(conversacionId: string, info?: any): void;
	notifyQuoteReviewRequired(info: QuoteReviewRequiredInfo): void;
}
