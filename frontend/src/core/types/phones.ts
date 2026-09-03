export type TipoTelefono = "PERSONAL" | "TRABAJO" | "WHATSAPP";

export interface Telefono {
	id: number;
	numero: string;
	tipo: TipoTelefono;
}
