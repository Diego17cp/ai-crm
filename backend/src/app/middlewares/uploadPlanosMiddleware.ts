import path from "node:path";
import fs from "fs";
import multer from "multer";
import { Request } from "express";
import { AppError } from "@/core/errors/AppError";
const uploadDir = path.join(process.cwd(), "public/uploads/planos");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => cb(null, uploadDir),
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `plano-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new AppError("Solo se permiten archivos PDF", 400));
};

export const uploadPlanosMiddleware = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
})
