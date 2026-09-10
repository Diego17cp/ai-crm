import { Response, NextFunction } from "express";
import { GetDashboardDataUseCase } from "../../application/use-cases/GetDashboardDataUseCase";
import { AuthRequest } from "@/app/middlewares/authGuard";

export class DashboardController {
	constructor(
		private readonly getDashboardDataUseCase: GetDashboardDataUseCase,
	) {}

	getDashboardData = async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const isAdmin = req.user!.rol === "ADMIN";
			const idAsesorQuery = req.query.id_asesor
				? String(req.query.id_asesor)
				: undefined;
			const idAsesor = isAdmin ? idAsesorQuery : req.user!.id;
			const data = await this.getDashboardDataUseCase.execute(idAsesor);
			res.status(200).json({ success: true, data });
		} catch (error) {
			next(error);
		}
	};
}
