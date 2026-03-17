export interface AuthUserProps {
	id: string;
	email: string;
	id_rol: number;
	estado: string;
	password_hash: string;
}

export class AuthUser {
	constructor(public readonly props: AuthUserProps) {}

	get id(): string {
		return this.props.id;
	}
	get email(): string {
		return this.props.email;
	}
	get isActive(): boolean {
		return this.props.estado === "ACTIVO";
	}
	get passwordHash(): string {
		return this.props.password_hash;
	}
}
