import { IDocumentTypeDTO } from "../../domain/dtos";
import { IDocTypesRepository } from "../ports/IDocTypesRepository";

export class DocTypesUseCases {
	constructor(private readonly repo: IDocTypesRepository) {}

	async getAllDocTypes(): Promise<IDocumentTypeDTO[]> {
		return this.repo.getAll();
	}
}
