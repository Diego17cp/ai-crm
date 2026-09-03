import { PrismaClient } from "generated/prisma/client";
import { IDocumentTypeDTO } from "../../domain/dtos";
import { IDocTypesRepository } from "../../application/ports/IDocTypesRepository";

export class PrismaDocTypesRepository implements IDocTypesRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getAll(): Promise<IDocumentTypeDTO[]> {
		return this.prisma.tipoDocIdentidad.findMany() as Promise<
			IDocumentTypeDTO[]
		>;
	}
}
