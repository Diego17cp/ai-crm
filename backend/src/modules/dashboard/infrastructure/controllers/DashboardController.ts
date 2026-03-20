import { Request, Response, NextFunction } from "express";
import { GetDashboardDataUseCase } from "../../application/use-cases/GetDashboardDataUseCase";

export class DashboardController {
    constructor(private readonly getDashboardDataUseCase: GetDashboardDataUseCase) {}

    getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.getDashboardDataUseCase.execute();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}