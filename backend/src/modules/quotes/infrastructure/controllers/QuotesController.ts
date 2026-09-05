import { NextFunction, Request, Response } from "express";
import { QuoteUseCases } from "../../application/use-cases/QuoteUseCases";

export class QuotesController {
	constructor(private quoteUseCases: QuoteUseCases) {}

	getQuoteById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { quoteId } = req.params;
			const quote = await this.quoteUseCases.getQuoteById(
				Number(quoteId),
			);
			res.json({ success: true, data: quote });
		} catch (error) {
			next(error);
		}
	};

	getPendingQueue = async (_: Request, res: Response, next: NextFunction) => {
		try {
			const queue = await this.quoteUseCases.getPendingQueue();
			res.json({ success: true, data: queue });
		} catch (error) {
			next(error);
		}
	};

	getMyReviews = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id_usuario } = req.query;
			const myReviews = await this.quoteUseCases.getMyReviews(
				String(id_usuario),
			);
			res.json({ success: true, data: myReviews });
		} catch (error) {
			next(error);
		}
	};
}
