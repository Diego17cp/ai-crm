import { Response, NextFunction } from "express";
import { AuthRequest } from "@/app/middlewares/authGuard";
import { LotesUseCases } from "../../application/use-cases/LotesUseCases";
import { EstadoLote } from "generated/prisma/client";
import {
	CreateLoteDTO,
	ImageUpdateInput,
	UpdateLoteDTO,
} from "../../domain/dtos";

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

			const result = await this.lotesUseCases.getAllLotes({
				q,
				page,
				limit,
				id_proyecto,
				id_etapa,
				id_manzana,
				estado,
			});

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
			const files = (req.files as Express.Multer.File[]) || [];
			const mainIdx =
				req.body.indice_principal !== undefined
					? Number(req.body.indice_principal)
					: 0;

			const dto: CreateLoteDTO = {
				id_manzana: Number(req.body.id_manzana),
				numero_lote: req.body.numero_lote,
				numero_partida: req.body.numero_partida,
				area_m2: Number(req.body.area_m2),
				precio_m2: Number(req.body.precio_m2),
				estado: req.body.estado,
				ubicacion_referencial: req.body.ubicacion_referencial,
			};
			const lote = await this.lotesUseCases.createLote(
				dto,
				files,
				mainIdx,
			);
			res.status(201).json({ success: true, data: lote });
		} catch (error) {
			next(error);
		}
	};

	update = async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const files = (req.files as Express.Multer.File[]) || [];

			const fields: UpdateLoteDTO = {};
			if (req.body.numero_lote !== undefined)
				fields.numero_lote = req.body.numero_lote;
			if (req.body.numero_partida !== undefined)
				fields.numero_partida = req.body.numero_partida;
			if (req.body.area_m2 !== undefined)
				fields.area_m2 = Number(req.body.area_m2);
			if (req.body.precio_m2 !== undefined)
				fields.precio_m2 = Number(req.body.precio_m2);
			if (req.body.ubicacion_referencial !== undefined)
				fields.ubicacion_referencial = req.body.ubicacion_referencial;
			if (req.body.estado !== undefined) fields.estado = req.body.estado;
			const images: ImageUpdateInput | undefined = req.body.imagenes
				? JSON.parse(req.body.imagenes)
				: undefined;
			const lote = await this.lotesUseCases.updateLote(
				id,
				{ ...fields, images },
				files,
			);
			res.status(200).json({ success: true, data: lote });
		} catch (error) {
			next(error);
		}
	};

	delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
