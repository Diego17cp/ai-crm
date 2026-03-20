export interface User {
    id: string;
    email: string;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    rol: string;
    estado: "ACTIVO" | "INACTIVO";
    isActive: boolean;
}