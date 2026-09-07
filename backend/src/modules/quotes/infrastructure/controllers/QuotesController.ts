import { NextFunction, Request, Response } from "express";
import { QuoteUseCases } from "../../application/use-cases/QuoteUseCases";
import { GetQuotesQueryDTO } from "../../domain/dtos";
import { AuthRequest } from "@/app/middlewares/authGuard";

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

	getQuotes = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const {
				q,
				estado,
				generado_por,
				id_usuario,
				page = 1,
				limit = 12,
			} = req.query;
			const quotes = await this.quoteUseCases.getQuotes({
				q: q ? String(q) : undefined,
				estado: estado
					? (estado as GetQuotesQueryDTO["estado"])
					: undefined,
				generado_por: generado_por
					? (generado_por as GetQuotesQueryDTO["generado_por"])
					: undefined,
				id_usuario: id_usuario ? String(id_usuario) : undefined,
				page: Number(page),
				limit: Number(limit),
			});
			res.json({ success: true, ...quotes });
		} catch (error) {
			next(error);
		}
	};

	createManualQuote = async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const idAsesor = req.user!.id;
			const result = await this.quoteUseCases.createManualQuote(
				req.body,
				idAsesor,
			);
			res.status(201).json({
				success: true,
				data: result.quote,
				entregadaPorWhatsapp: result.deliveredByWhatsapp,
			});
		} catch (error) {
			next(error);
		}
	};
}
