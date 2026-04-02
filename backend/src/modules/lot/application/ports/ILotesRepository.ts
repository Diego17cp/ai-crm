import { Lotes, LotesImagenes } from "generated/prisma/client";
import { CreateLoteDTO, UpdateLoteDTO, GetLotesQueryDTO, PaginatedLotesResult } from "../../domain/dtos";

export type LoteWithRelationsDTO = Lotes & {
    imagenes: LotesImagenes[];
    manzana: {
        codigo: string;
        etapa: {
            nombre: string;
            proyecto: {
                nombre: string;
            }
        }
    }
};

export interface ILotesRepository {
    findPaginated(query: GetLotesQueryDTO): Promise<PaginatedLotesResult<LoteWithRelationsDTO>>;
    findById(id: number): Promise<LoteWithRelationsDTO | null>;
    create(data: CreateLoteDTO): Promise<Lotes>;
    update(id: number, data: UpdateLoteDTO): Promise<Lotes>;
    delete(id: number): Promise<any>;
    hasSales(id: number): Promise<boolean>;
}