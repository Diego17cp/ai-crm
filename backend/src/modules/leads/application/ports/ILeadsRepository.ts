import {
	Clientes,
	TelefonosCliente,
	TipoDocIdentidad,
	Ubigeos,
} from "generated/prisma/client";
import {
	CreateLeadDTO,
	GetLeadsQueryDTO,
	PaginatedLeadsResult,
	UpdateLeadDTO,
} from "../../domain/dtos";

export type LeadWithRelationsDTO = Clientes & {
	telefonos: TelefonosCliente[];
	tipo_doc: TipoDocIdentidad;
	ubigeo: Ubigeos | null;
};

export interface ILeadsRepository {
	findPaginated(
		query: GetLeadsQueryDTO,
	): Promise<PaginatedLeadsResult<LeadWithRelationsDTO>>;
	findById(id: number): Promise<LeadWithRelationsDTO | null>;
	create(data: CreateLeadDTO): Promise<Clientes>;
	update(id: number, data: UpdateLeadDTO): Promise<Clientes>;
	delete(id: number): Promise<Clientes>;
	findByDocument(idTipoDoc: number, numero: string): Promise<LeadWithRelationsDTO | null>;
	findPhonesInUse(numeros: string[], excludeLeadId?: number): Promise<string[]>;
	hasSalesOrDebts(id: number): Promise<boolean>;
}
