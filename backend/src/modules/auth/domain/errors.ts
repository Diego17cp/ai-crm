import { AppError } from "@/core/errors/AppError";

export class InvalidCredentialsError extends AppError {
	constructor() {
		super("Correo o contraseña incorrectos", 401);
	}
}

export class UnauthorizedUserError extends AppError {
	constructor(message: string = "Usuario no autorizado o inactivo") {
		super(message, 403);
	}
}

export class InvalidTokenError extends AppError {
	constructor() {
		super("Token inválido o expirado", 401);
	}
}
