export interface QuoteQueueItem {
	id: number;
	codigo: string;
	cliente: string;
	proyecto: string;
	lote: string;
	precio_final: number;
	motivo_revision: string;
	createdAt: string;
}

export interface QuoteReviewRequiredEvt {
	message: string;
	timeStamp: string;
	info: {
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
	};
}
