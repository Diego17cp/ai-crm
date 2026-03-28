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
export interface UserDTO {
	id: string;
	rol: {
		id: number;
		nombre: string;
	}
	dni: string;
	nombres: string;
	apellidos: string;
	email: string;
	telefono?: string | null;
	estado: "ACTIVO" | "INACTIVO";
	ultimo_login?: Date | null;
	created_at: Date;
	updated_at: Date;
}
export interface GetUsersQueryDTO {
	page: number;
	limit: number;
	estado?: "ACTIVO" | "INACTIVO" | undefined;
	id_rol?: number | undefined;
	q?: string | undefined;
}
export interface PaginatedUsersResult<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}