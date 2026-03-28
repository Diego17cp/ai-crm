import { NextFunction, Request, Response } from "express";
import { RolesUseCases } from "../../application/use-cases/RolesUseCases";

export class RolesController {
    constructor(private rolesUseCases: RolesUseCases) {}
    getAllRoles = async (_: Request, res: Response, next: NextFunction) => {
        try {
            const roles = await this.rolesUseCases.getAllRoles();
            res.status(200).json({ success: true, data: roles });
        } catch (error) {
            next(error);
        }
    }
}