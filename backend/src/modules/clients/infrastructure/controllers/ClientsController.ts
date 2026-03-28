import { Request, Response, NextFunction } from "express";
import { ClientsUseCases } from "../../application/use-cases/ClientsUseCases";
import {
	ActitudCliente,
	EstadoCivil,
	SexoPersona,
	SolvenciaEconomica,
} from "generated/prisma/client";

export class ClientsController {
	constructor(private readonly clientsUseCases: ClientsUseCases) {}

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const q = req.query.q as string | undefined;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;

			const sexo = req.query.sexo as SexoPersona | undefined;
			const estado_civil = req.query.estado_civil as
				| EstadoCivil
				| undefined;
			const solvencia = req.query.solvencia as
				| SolvenciaEconomica
				| undefined;
			const actitud = req.query.actitud as ActitudCliente | undefined;

			let es_peruano: boolean | undefined = undefined;
			if (req.query.es_peruano === "true") es_peruano = true;
			if (req.query.es_peruano === "false") es_peruano = false;

			const result = await this.clientsUseCases.getAllClients({
				q,
				page,
				limit,
				sexo,
				es_peruano,
				estado_civil,
				solvencia,
				actitud,
			});

			res.status(200).json({
				success: true,
				data: result.data,
				meta: result.meta,
			});
		} catch (error) {
			next(error);
		}
	};

	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const client = await this.clientsUseCases.getClientById(id);
			res.status(200).json({ success: true, data: client });
		} catch (error) {
			next(error);
		}
	};

	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const client = await this.clientsUseCases.createClient(req.body);
			res.status(201).json({ success: true, data: client });
		} catch (error) {
			next(error);
		}
	};

	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const client = await this.clientsUseCases.updateClient(id, req.body);
			res.status(200).json({ success: true, data: client });
		} catch (error) {
			next(error);
		}
	};

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const client = await this.clientsUseCases.deleteClient(id);
            res.status(200).json({ success: true, data: client });
        } catch (error) {
            next(error);
        }
    };
}