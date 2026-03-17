export interface UserProps {
	id?: string;
	id_rol: number;
	dni: string;
	nombres: string;
	apellidos: string;
	email: string;
	password_hash: string;
	telefono?: string | null;
	ultimo_login?: Date | null;
	estado?: "ACTIVO" | "INACTIVO";
	created_at?: Date;
	updated_at?: Date;
}

export class User {
	constructor(public readonly props: UserProps) {}
	get id(): string | undefined {
		return this.props.id;
	}
	get email(): string {
		return this.props.email;
	}
	get estado(): string | undefined {
		return this.props.estado;
	}

	public desactivar(): void {
		this.props.estado = "INACTIVO";
	}
}
