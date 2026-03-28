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
} from "@/modules/leads/domain/dtos";

export type ClientWithRelationsDTO = Clientes & {
	telefonos: TelefonosCliente[];
	tipo_doc: TipoDocIdentidad;
	ubigeo: Ubigeos | null;
};

export interface IClientsRepository {
	findPaginated(
		query: GetLeadsQueryDTO,
	): Promise<PaginatedLeadsResult<ClientWithRelationsDTO>>;
	findById(id: number): Promise<ClientWithRelationsDTO | null>;
	create(data: CreateLeadDTO): Promise<Clientes>;
	update(id: number, data: UpdateLeadDTO): Promise<Clientes>;
	delete(id: number): Promise<Clientes>;
	findByDocument(idTipoDoc: number, numero: string): Promise<ClientWithRelationsDTO | null>;
	findPhonesInUse(numeros: string[], excludeLeadId?: number): Promise<string[]>;
}
