import {
	Leads,
	Personas,
	TelefonosPersona,
	TipoDocIdentidad,
	Ubigeos,
} from "generated/prisma/client";
import {
	CreateLeadDTO,
	GetLeadsQueryDTO,
	PaginatedLeadsResult,
	UpdateLeadDTO,
} from "../../domain/dtos";

export type LeadWithRelationsDTO = Leads & {
	persona: Personas & {
		telefonos: TelefonosPersona[];
		tipo_doc: TipoDocIdentidad;
		ubigeo: Ubigeos | null;
	};
};

export interface ILeadsRepository {
	findPaginated(
		query: GetLeadsQueryDTO,
	): Promise<PaginatedLeadsResult<LeadWithRelationsDTO>>;
	findById(id: number): Promise<LeadWithRelationsDTO | null>;
	create(data: CreateLeadDTO): Promise<Leads>;
	update(id: number, data: UpdateLeadDTO): Promise<Leads>;
	delete(id: number): Promise<Leads>;
	findByDocument(
		idTipoDoc: number,
		numero: string,
	): Promise<LeadWithRelationsDTO | null>;
	findPhonesInUse(
		numeros: string[],
		excludePersonaId?: number,
	): Promise<string[]>;
	hasSalesOrDebts(id: number): Promise<boolean>;
}
