import { CreateLoteDTO, GetLotesQueryDTO, UpdateLoteDTO } from "../../domain/dtos";
import { ILotesRepository } from "../ports/ILotesRepository";
import { AppError } from "@/core/errors/AppError";

export class LotesUseCases {
    constructor(private readonly repo: ILotesRepository) {}

    async getAllLotes(query: GetLotesQueryDTO) {
        return this.repo.findPaginated(query);
    }

    async getLoteById(id: number) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de lote inválido", 400);
        const lote = await this.repo.findById(id);
        if (!lote) throw new AppError("Lote no encontrado", 404);
        return lote;
    }

    async createLote(data: CreateLoteDTO) {
        if (!data.id_manzana || data.id_manzana <= 0) throw new AppError("ID de manzana requerido", 400);
        if (!data.numero_lote || data.numero_lote.trim() === "") throw new AppError("El número de lote es requerido", 400);
        if (data.area_m2 <= 0) throw new AppError("El área del lote debe ser mayor a 0", 400);
        if (data.precio_m2 < 0) throw new AppError("El precio por m2 no puede ser negativo", 400);

        return this.repo.create({
            ...data,
            numero_lote: data.numero_lote.trim().toUpperCase(),
            numero_partida: data.numero_partida?.trim() || ""
        });
    }

    async updateLote(id: number, data: UpdateLoteDTO) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de lote inválido", 400);
        const lote = await this.repo.findById(id);
        if (!lote) throw new AppError("Lote no encontrado", 404);
        const currentState = lote.estado?.toUpperCase();
        if (currentState === "VENDIDO" || currentState === "RESERVADO") {
            throw new AppError("No se puede actualizar un lote que ya ha sido vendido o reservado", 400);
        }
        return this.repo.update(id, data);
    }

    async deleteLote(id: number) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de lote inválido", 400);
        const existing = await this.repo.findById(id);
        if (!existing) throw new AppError("Lote no encontrado", 404);
        const hasSales = await this.repo.hasSales(id);
        if (hasSales) throw new AppError("No se puede eliminar el lote porque tiene ventas asociadas.", 409);
        return this.repo.delete(id);
    }
}