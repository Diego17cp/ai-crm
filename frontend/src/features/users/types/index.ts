import type { Role } from "@/features/roles/types";

export interface User {
    id: string;
    rol: Role;
    dni: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string | null;
    estado: "ACTIVO" | "INACTIVO";
    ultimo_login: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserResponse {
    success: boolean;
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
}
export interface UserFilters {
    page: number;
    limit: number;
    estado?: "ACTIVO" | "INACTIVO";
    id_rol?: number;
    q?: string;
}

export interface CreateUserPayload {
    id_rol: number;
    dni: string;
    nombres: string;
    apellidos: string;
    email: string;
    password_plain: string;
    telefono?: string;
}
export interface UpdateUserPayload extends Partial<Omit<CreateUserPayload, "password_plain">> {
    estado?: "ACTIVO" | "INACTIVO";
}