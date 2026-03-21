import { Request, Response, NextFunction } from "express";
import { ProyectosUseCases } from "../../application/use-cases/ProyectosUseCases";

export class ProyectosController {
    constructor(private readonly proyectosUseCases: ProyectosUseCases) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const q = req.query.q as string | undefined;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.proyectosUseCases.getAllProyectos({ q, page, limit });
            
            res.status(200).json({ 
                success: true, 
                data: result.data,
                meta: result.meta
            });
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const proyecto = await this.proyectosUseCases.createProyecto(data);
            res.status(201).json({ success: true, data: proyecto });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const proyecto = await this.proyectosUseCases.updateProyecto(id, data);
            res.status(200).json({ success: true, data: proyecto });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const proyecto = await this.proyectosUseCases.deleteProyecto(id);
            res.status(200).json({ success: true, data: proyecto, message: "Proyecto eliminado (lógico)" });
        } catch (error) {
            next(error);
        }
    };

    createEtapa = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id_proyecto = Number(req.params.id_proyecto);
            const etapa = await this.proyectosUseCases.createEtapa({ ...req.body, id_proyecto });
            res.status(201).json({ success: true, data: etapa });
        } catch (error) {
            next(error);
        }
    };

    updateEtapa = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const etapa = await this.proyectosUseCases.updateEtapa(id, data);
            res.status(200).json({ success: true, data: etapa });
        } catch (error) {
            next(error);
        }
    };

    deleteEtapa = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const etapa = await this.proyectosUseCases.deleteEtapa(id);
            res.status(200).json({ success: true, data: etapa, message: "Etapa eliminada (lógico)" });
        } catch (error) {
            next(error);
        }
    };

    createManzana = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id_etapa = Number(req.params.id_etapa);
            const manzana = await this.proyectosUseCases.createManzana({ ...req.body, id_etapa });
            res.status(201).json({ success: true, data: manzana });
        } catch (error) {
            next(error);
        }
    };

    createManzanasBatch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id_etapa = Number(req.params.id_etapa);
            const { codigos } = req.body;
            const count = await this.proyectosUseCases.createManzanasBatch({ id_etapa, codigos });
            res.status(201).json({ success: true, count, message: `${count} manzanas creadas` });
        } catch (error) {
            next(error);
        }
    }

    updateManzana = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const manzana = await this.proyectosUseCases.updateManzana(id, data);
            res.status(200).json({ success: true, data: manzana });
        } catch (error) {
            next(error);
        }
    };

    deleteManzana = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const manzana = await this.proyectosUseCases.deleteManzana(id);
            res.status(200).json({ success: true, data: manzana, message: "Manzana eliminada (lógico)" });
        } catch (error) {
            next(error);
        }
    };
}