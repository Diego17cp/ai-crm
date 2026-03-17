export interface CreateUserDTO {
	id_rol: number;
	dni: string;
	nombres: string;
	apellidos: string;
	email: string;
	password_plain: string;
	telefono?: string;
}

export interface UpdateUserDTO {
	id_rol?: number;
	nombres?: string;
	apellidos?: string;
	telefono?: string;
	estado?: "ACTIVO" | "INACTIVO";
}
