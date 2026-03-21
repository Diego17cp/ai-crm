import { NextFunction, Request, Response } from "express";
import { UbigeosUseCases } from "../../application/use-cases/UbigeosUseCases";

export class UbigeosController {
    constructor(private readonly useCases: UbigeosUseCases) {}
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ubigeos = await this.useCases.getAllUbigeos();
            res.status(200).json({ success: true, data: ubigeos });
        } catch (error) {
            next(error);
        }
    }
}