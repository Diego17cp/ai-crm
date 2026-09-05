import { Prisma } from "generated/prisma/client";
import { QuoteQueueItemDTO, QuoteWithRelations } from "../../domain/dtos";

export interface IQuoteRepository {
	claimReview(quoteId: number, asesorId: string): Promise<boolean>;
	findByIdWithRelations(quoteId: number): Promise<QuoteWithRelations | null>;
	markApproved(
		tx: Prisma.TransactionClient,
		quoteId: number,
		asesorId: string,
		pdfUrl: string,
	): Promise<boolean>;
	markRejected(
		tx: Prisma.TransactionClient,
		quoteId: number,
		asesorId: string,
		motivoRechazo?: string | undefined,
	): Promise<boolean>;
	findPendingQueue(): Promise<QuoteQueueItemDTO[]>;
	findMyReviews(idUsuario: string): Promise<QuoteQueueItemDTO[]>;
}
