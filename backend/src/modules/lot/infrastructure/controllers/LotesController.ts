import { Response, NextFunction } from "express";
import { AuthRequest } from "@/app/middlewares/authGuard";
import { LotesUseCases } from "../../application/use-cases/LotesUseCases";
import { EstadoLote } from "generated/prisma/client";

export class LotesController {
	constructor(private readonly lotesUseCases: LotesUseCases) {}

	getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const q = req.query.q as string | undefined;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;

			const id_proyecto = req.query.id_proyecto
				? Number(req.query.id_proyecto)
				: undefined;
			const id_etapa = req.query.id_etapa
				? Number(req.query.id_etapa)
				: undefined;
			const id_manzana = req.query.id_manzana
				? Number(req.query.id_manzana)
				: undefined;
			const estado = req.query.estado as EstadoLote | undefined;

			const result = await this.lotesUseCases.getAllLotes(
				{
					q,
					page,
					limit,
					id_proyecto,
					id_etapa,
					id_manzana,
					estado,
				},
			);

			res.status(200).json({
				success: true,
				data: result.data,
				meta: result.meta,
			});
		} catch (error) {
			next(error);
		}
	};

	getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const lote = await this.lotesUseCases.getLoteById(id);
			res.status(200).json({ success: true, data: lote });
		} catch (error) {
			next(error);
		}
	};

	create = async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const lote = await this.lotesUseCases.createLote(req.body);
			res.status(201).json({ success: true, data: lote });
		} catch (error) {
			next(error);
		}
	};

	update = async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const lote = await this.lotesUseCases.updateLote(id, req.body);
			res.status(200).json({ success: true, data: lote });
		} catch (error) {
			next(error);
		}
	};

	delete = async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const id = Number(req.params.id);
			const lote = await this.lotesUseCases.deleteLote(id);
			res.status(200).json({
				success: true,
				data: lote,
				message: "Lote eliminado",
			});
		} catch (error) {
			next(error);
		}
	};
}
