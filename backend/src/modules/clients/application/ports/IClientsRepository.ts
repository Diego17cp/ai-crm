import {
	Clientes,
	Personas,
	Prisma,
	TelefonosPersona,
	TipoDocIdentidad,
	Ubigeos,
} from "generated/prisma/client";
import {
	CreateClientDTO,
	GetClientsQueryDTO,
	PaginatedClientsResult,
	UpdateClientDTO,
} from "../../domain/dtos";

export type ClientWithRelationsDTO = Clientes & {
	persona: Personas & {
		telefonos: TelefonosPersona[];
		tipo_doc: TipoDocIdentidad;
		ubigeo: Ubigeos | null;
	};
};

export interface IClientsRepository {
	findPaginated(
		query: GetClientsQueryDTO,
	): Promise<PaginatedClientsResult<ClientWithRelationsDTO>>;
	findById(id: number): Promise<ClientWithRelationsDTO | null>;
	create(data: CreateClientDTO, tx?: Prisma.TransactionClient): Promise<Clientes>;
	update(id: number, data: UpdateClientDTO): Promise<Clientes>;
	delete(id: number): Promise<Clientes>;
	findByDocument(
		idTipoDoc: number,
		numero: string,
	): Promise<ClientWithRelationsDTO | null>;
	findPhonesInUse(
		numeros: string[],
		excludePersonaId?: number,
	): Promise<string[]>;
	hasSalesOrDebts(id: number): Promise<boolean>;
}
