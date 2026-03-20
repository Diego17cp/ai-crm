export interface AuthUserProps {
    id: string;
    email: string;
    id_rol: number;
    rol_nombre?: string;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    estado: string;
    password_hash: string;
}

export class AuthUser {
    constructor(public readonly props: AuthUserProps) {}

    get id(): string { return this.props.id; }
    get email(): string { return this.props.email; }
    get nombres(): string { return this.props.nombres; }
    get apellidos(): string { return this.props.apellidos; }
    get telefono(): string | null { return this.props.telefono; }
    get rolNombre(): string { return this.props.rol_nombre || "USUARIO"; }
    get estado(): string { return this.props.estado; }
    get isActive(): boolean { return this.props.estado === "ACTIVO"; }
    get passwordHash(): string { return this.props.password_hash; }
}
