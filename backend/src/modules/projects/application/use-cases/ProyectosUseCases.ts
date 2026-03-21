import { CreateEtapaDTO, CreateManzanaDTO, CreateProyectoDTO, GetProyectosQueryDTO, UpdateEtapaDTO, UpdateManzanaDTO, UpdateProyectoDTO } from "../../domain/dtos";
import { IProyectosRepository } from "../ports/IProyectosRepository";
import { AppError } from "@/core/errors/AppError";

export class ProyectosUseCases {
    constructor(private readonly repo: IProyectosRepository) {}

    async getAllProyectos(query: GetProyectosQueryDTO) {
        return this.repo.findPaginated(query);
    }

    async createProyecto(data: CreateProyectoDTO) {
        return this.repo.create(data);
    }

    async updateProyecto(id: number, data: UpdateProyectoDTO) {
        const existing = await this.repo.findById(id);
        if (!existing) throw new AppError("Proyecto no encontrado", 404);
        return this.repo.update(id, data);
    }

    async deleteProyecto(id: number) {
        return this.repo.softDelete(id);
    }

    async createEtapa(data: CreateEtapaDTO) {
        const proyecto = await this.repo.findById(data.id_proyecto);
        if (!proyecto) throw new AppError("Proyecto no encontrado", 404);
        return this.repo.createEtapa(data);
    }

    async updateEtapa(id: number, data: UpdateEtapaDTO) {
        return this.repo.updateEtapa(id, data);
    }

    async deleteEtapa(id: number) {
        return this.repo.softDeleteEtapa(id);
    }

    async createManzana(data: CreateManzanaDTO) {
        const etapa = await this.repo.updateEtapa(data.id_etapa, {});
        if (!etapa) throw new AppError("Etapa no encontrada", 404);
        return this.repo.createManzana(data);
    }

    async updateManzana(id: number, data: UpdateManzanaDTO) {
        return this.repo.updateManzana(id, data);
    }

    async deleteManzana(id: number) {
        return this.repo.softDeleteManzana(id);
    }
}