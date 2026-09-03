import type { SimpleData } from "@/shared/types";
import type { Ubigeo } from "./ubigeos";
import type { Telefono } from "./phones";

export type Sexo = "M" | "F";
export type EstadoCivil = "SOLTERO" | "CASADO" | "DIVORCIADO" | "CONVIVIENTE";

export interface Person {
	id: number;
	id_tipo_doc_identidad: number;
	id_ubigeo: string | null;
	numero: string;
	nombres: string | null;
	apellidos: string | null;
	fecha_nacimiento: string | null;
	sexo: "M" | "F" | null;
	estado_civil: "SOLTERO" | "CASADO" | "DIVORCIADO" | "CONVIVIENTE" | null;
	es_peruano: boolean | null;
	nacionalidad: string | null;
	direccion: string | null;
	email: string | null;
	ocupacion: string | null;
	tipo_doc: SimpleData;
	ubigeo: Ubigeo | null;
	telefonos: Telefono[];
}
