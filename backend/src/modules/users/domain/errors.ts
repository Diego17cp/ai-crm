import { AppError } from "@/core/errors/AppError";

export class UserNotFoundError extends AppError {
	constructor() {
		super("Usuario no encontrado", 404);
	}
}

export class UserAlreadyExistsError extends AppError {
	constructor(
		message: string = "El usuario ya existe con este email, DNI o Teléfono",
	) {
		super(message, 400);
	}
}
