import { Request, Response, NextFunction } from "express";
import { UserUseCases } from "../../application/use-cases/UserUseCases";

export class UserController {
	constructor(private readonly userUseCases: UserUseCases) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await this.userUseCases.createUser(req.body);
			const { password_hash, ...userResponse } = user.props; // Removemos el hash para la respuesta
			res.status(201).json({ success: true, data: userResponse });
		} catch (error) {
			next(error);
		}
	};
	
	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const query = {
				page: Number(req.query.page) || 1,
				limit: Number(req.query.limit) || 10,
				estado: req.query.estado as "ACTIVO" | "INACTIVO" | undefined,
				id_rol: req.query.id_rol ? Number(req.query.id_rol) : undefined,
				q: req.query.q as string | undefined,
			};
			const result = await this.userUseCases.getUsers(query);
			res.status(200).json({ success: true, ...result });
		}
		catch (error) {
			next(error);
		}
	}

	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await this.userUseCases.getUserById(req.params.id as string);
			const { password_hash, ...userResponse } = user.props;
			res.status(200).json({ success: true, data: userResponse });
		} catch (error) {
			next(error);
		}
	};

	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await this.userUseCases.updateUser(
				req.params.id as string,
				req.body,
			);
			const { password_hash, ...userResponse } = user.props;
			res.status(200).json({ success: true, data: userResponse });
		} catch (error) {
			next(error);
		}
	};

	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Endpoint que internamente hace el borrado lógico (estado INACTIVO)
			await this.userUseCases.deleteUser(req.params.id as string);
			res.status(200).json({
				success: true,
				message: "Usuario desactivado correctamente",
			});
		} catch (error) {
			next(error);
		}
	};
}
