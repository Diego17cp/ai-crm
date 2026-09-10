import { AuthRequest } from "@/app/middlewares/authGuard";
import { MetricsUseCases } from "../../application/use-cases/MetricsUseCases";
import { NextFunction, Response } from "express";
import { AppError } from "@/core/errors/AppError";

export class MetricsController {
	constructor(private metricsUseCases: MetricsUseCases) {}

	getAdvisorMetrics = async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { idUsuario } = req.params;
			const esAdmin = req.user!.rol === "ADMIN";
			if (!esAdmin && idUsuario !== req.user!.id) {
				throw new AppError(
					"No puedes ver las métricas de otro asesor",
					403,
				);
			}
			const desde = req.query.desde
				? new Date(String(req.query.desde))
				: this.sieteDiasAtras();
			const hasta = req.query.hasta
				? new Date(String(req.query.hasta))
				: new Date();
			const data = await this.metricsUseCases.getAdvisorMetrics(
				String(idUsuario),
				desde,
				hasta,
			);
			res.json({ success: true, data });
		} catch (error) {
			next(error);
		}
	};

	getAdminOverview = async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			if (req.user!.rol !== "ADMIN")
				throw new AppError("No autorizado", 403);
			const desde = req.query.desde
				? new Date(String(req.query.desde))
				: this.sieteDiasAtras();
			const hasta = req.query.hasta
				? new Date(String(req.query.hasta))
				: new Date();
			const data = await this.metricsUseCases.getAdminOverview(
				desde,
				hasta,
			);
			res.json({ success: true, data });
		} catch (error) {
			next(error);
		}
	};

	sieteDiasAtras = () => {
		return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	};
}
