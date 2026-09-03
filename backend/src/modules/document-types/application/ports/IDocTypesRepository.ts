import { IDocumentTypeDTO } from "../../domain/dtos";

export interface IDocTypesRepository {
	getAll(): Promise<IDocumentTypeDTO[]>;
}