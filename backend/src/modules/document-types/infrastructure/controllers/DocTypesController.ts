import { DocTypesUseCases } from "../../application/use-cases/DocTypesUseCases";
import { NextFunction, Request, Response } from "express";

export class DocTypesController {
	constructor(private readonly useCases: DocTypesUseCases) {}

	getAll = async (_: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.useCases.getAllDocTypes();
			res.status(200).json({
				success: true,
				data: result,
			});
		} catch (err) {
			next(err);
		}
	};
}
