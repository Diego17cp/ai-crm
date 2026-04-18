import { Request, Response, NextFunction } from "express";
import { SalesUseCases } from "../../application/use-cases/SalesUseCases";

export class SalesController {
	constructor(private readonly useCases: SalesUseCases) {}

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.useCases.getAllSales({
				page: parseInt(req.query.page as string) || 1,
				limit: parseInt(req.query.limit as string) || 10,
				estado_venta: req.query.estado_venta as any,
				estado_contrato: req.query.estado_contrato as any,
				tipo_pago: req.query.tipo_pago as any,
				q: req.query.q as string,
				fecha_inicio: req.query.fecha_inicio as string,
				fecha_fin: req.query.fecha_fin as string,
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

	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
            const id = Number(req.params.id);
            const sale = await this.useCases.getSaleById(id);
			res.status(200).json({
                success: true,
                data: sale,
            });
		} catch (error) {
			next(error);
		}
	};

	getCollections = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const result = await this.useCases.processCollectionBoard({
				page: parseInt(req.query.page as string) || 1,
				limit: parseInt(req.query.limit as string) || 20,
				filtro: req.query.filtro as any,
				dias_proximas: req.query.dias
					? parseInt(req.query.dias as string)
					: 7,
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

	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const newSale = await this.useCases.createSale(req.body);
			res.status(201).json({
				success: true,
				message: "Venta procesada con éxito",
				data: newSale,
			});
		} catch (error) {
			next(error);
		}
	};

	payQuota = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const paidQuota = await this.useCases.payQuota(
				Number(req.params.idCuota),
				req.body,
			);
			res.status(200).json({
				success: true,
				message: "Cuota marcada como pagada",
				data: paidQuota,
			});
		} catch (error) {
			next(error);
		}
	};

	sendDebtRemind = async (req: Request, res: Response, next: NextFunction) => {
		try {
			await this.useCases.sendDebtRemind(Number(req.params.idCuota));
			res.status(200).json({
				success: true,
				message: "Recordatorio de deuda enviado",
			});
		} catch (error) {
			next(error);
			return;
		}
	};
}
