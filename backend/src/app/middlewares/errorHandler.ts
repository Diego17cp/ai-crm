import { AppError } from "@/core/errors/AppError";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	console.error(err);
	if (err instanceof ZodError) {
		return res.status(400).json({
			success: false,
			error: "ValidationError",
			message: "Validation failed",
			details: err.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
				code: issue.code,
			})),
		});
	}
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			error: err.name,
			message: err.message,
		});
	}
	return res.status(err.status || 500).json({
		success: false,
		error: "InternalServerError",
		message: err.message || "Something went wrong:(",
	});
};