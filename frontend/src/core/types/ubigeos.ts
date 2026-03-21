export interface Ubigeo {
    id: string;
    nombre: string;
}
export interface UbigeoResponse {
    success: boolean;
    data: Ubigeo[];
}