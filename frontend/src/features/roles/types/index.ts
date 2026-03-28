export interface Role {
    id: number;
    nombre: string;
}
export interface RoleResponse {
    success: boolean;
    data: Role[];
}