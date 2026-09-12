import { Lotes, LotesImagenes } from "generated/prisma/client";
import {
	CreateLoteDTO,
	UpdateLoteDTO,
	GetLotesQueryDTO,
	PaginatedLotesResult,
	CreateImage,
} from "../../domain/dtos";

export type LoteWithRelationsDTO = Lotes & {
	imagenes: LotesImagenes[];
	manzana: {
		codigo: string;
		etapa: {
			nombre: string;
			proyecto: {
				nombre: string;
			};
		};
	};
};

export interface ILotesRepository {
	findPaginated(
		query: GetLotesQueryDTO,
	): Promise<PaginatedLotesResult<LoteWithRelationsDTO>>;
	findById(id: number): Promise<LoteWithRelationsDTO | null>;
	create(data: CreateLoteDTO): Promise<Lotes>;
	createWithImages(
		data: CreateLoteDTO,
		imagenes: CreateImage[],
	): Promise<Lotes & { imagenes: LotesImagenes[] }>;
	update(
		id: number,
		data: UpdateLoteDTO,
		newFiles?: Express.Multer.File[],
	): Promise<Lotes & { imagenes: LotesImagenes[] }>;
	delete(id: number): Promise<any>;
	hasSales(id: number): Promise<boolean>;
}
