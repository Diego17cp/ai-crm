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
