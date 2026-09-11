import { AppError } from "@/core/errors/AppError";
import { Request } from "express";
import multer from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";

const uploadDir = join(process.cwd(), "public/uploads/lotes_imagenes");
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req: Request, _file: Express.Multer.File, cb) =>
		cb(null, uploadDir),
	filename: (_req: Request, file: Express.Multer.File, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = extname(file.originalname);
		cb(null, `lote-${uniqueSuffix}${ext}`);
	},
});

const fileFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedExtensions = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
	];
	if (allowedExtensions.includes(file.mimetype)) cb(null, true);
	else cb(new AppError("Solo se permiten imágenes (JPG, PNG, WEBP)", 400));
};

export const uploadLotesImagenesMiddleware = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter,
});
