import {
	CreateEtapaDTO,
	CreateManzanaDTO,
	CreateManzanasBatchDTO,
	CreateProyectoDTO,
	GetProyectosQueryDTO,
	UpdateEtapaDTO,
	UpdateManzanaDTO,
	UpdateProyectoDTO,
} from "../../domain/dtos";
import { IProyectosRepository } from "../ports/IProyectosRepository";
import { AppError } from "@/core/errors/AppError";

export class ProyectosUseCases {
	constructor(private readonly repo: IProyectosRepository) {}

	async getAllProyectos(query: GetProyectosQueryDTO) {
		return this.repo.findPaginated(query);
	}

	async createProyecto(data: CreateProyectoDTO) {
		if (!data.id_ubigeo || data.id_ubigeo.trim() === "") throw new AppError("El ubigeo es requerido", 400);
		if (!data.nombre || data.nombre.trim() === "") throw new AppError("El nombre del proyecto es requerido", 400);
		return this.repo.create({
			...data,
			nombre: data.nombre.trim(),
			abreviatura: data.abreviatura?.trim() || "",
		});
	}

	async updateProyecto(id: number, data: UpdateProyectoDTO) {
		if (isNaN(id) || id <= 0) throw new AppError("ID de proyecto inválido", 400);
		const existing = await this.repo.findById(id);
		if (!existing) throw new AppError("Proyecto no encontrado", 404);
		if (existing.estado === "INACTIVO")
			throw new AppError(
				"No se puede actualizar un proyecto inactivo",
				400,
			);
		return this.repo.update(id, data);
	}

	async deleteProyecto(id: number) {
		if (isNaN(id) || id <= 0) throw new AppError("ID de proyecto inválido", 400);
		const existing = await this.repo.findById(id);
		if (!existing) throw new AppError("Proyecto no encontrado", 404);

		return this.repo.softDelete(id);
	}

	async createEtapa(data: CreateEtapaDTO) {
		if (isNaN(data.id_proyecto) || data.id_proyecto <= 0) throw new AppError("ID de proyecto inválido", 400);
		if (!data.nombre || data.nombre.trim() === "") throw new AppError("El nombre de la etapa es requerido", 400);

		const proyecto = await this.repo.findById(data.id_proyecto);
		if (!proyecto) throw new AppError("Proyecto no encontrado", 404);
		if (proyecto.estado === "INACTIVO")
			throw new AppError(
				"No se pueden agregar etapas a un proyecto inactivo",
				400,
			);
		const existeNombre = proyecto.etapas.find(
			(e) =>
				e.nombre.toLowerCase() === data.nombre.trim().toLowerCase() &&
				e.estado === "ACTIVO",
		);
		if (existeNombre)
			throw new AppError(
				"Ya existe una Etapa con ese nombre en el proyecto",
				400,
			);
		return this.repo.createEtapa({
			id_proyecto: data.id_proyecto,
			nombre: data.nombre.trim(),
		});
	}

	async updateEtapa(id: number, data: UpdateEtapaDTO) {
		if (isNaN(id) || id <= 0)
			throw new AppError("ID de etapa inválido", 400);

		if (data.nombre !== undefined && data.nombre.trim() === "") {
			throw new AppError(
				"El nombre de la etapa no puede estar vacío",
				400,
			);
		}

		return this.repo.updateEtapa(id, data);
	}

	async deleteEtapa(id: number) {
		if (isNaN(id) || id <= 0)
			throw new AppError("ID de etapa inválido", 400);
		return this.repo.softDeleteEtapa(id);
	}

	async createManzana(data: CreateManzanaDTO) {
		if (isNaN(data.id_etapa) || data.id_etapa <= 0) throw new AppError("ID de etapa inválido", 400);
		if (!data.codigo || data.codigo.trim() === "") throw new AppError("El código de la manzana es requerido", 400);
		return this.repo.createManzana({
			id_etapa: data.id_etapa,
			codigo: data.codigo.trim().toUpperCase(),
		});
	}

	async createManzanasBatch(data: CreateManzanasBatchDTO) {
		if (isNaN(data.id_etapa) || data.id_etapa <= 0) throw new AppError("ID de etapa inválido", 400);
		if (
			!data.codigos ||
			!Array.isArray(data.codigos) ||
			data.codigos.length === 0
		) {
			throw new AppError(
				"No se proporcionaron códigos de manzana válidos",
				400,
			);
		}
		const codigosLimpios = data.codigos
			.filter((c) => c && c.trim() !== "")
			.map((c) => c.trim().toUpperCase());

		if (codigosLimpios.length === 0) {
			throw new AppError(
				"Todos los códigos proporcionados estaban vacíos",
				400,
			);
		}

		// Para evitar mandar duplicados en la MISMA request
		const codigosUnicos = [...new Set(codigosLimpios)];

		return this.repo.createManzanasBatch({
			id_etapa: data.id_etapa,
			codigos: codigosUnicos,
		});
	}

	async updateManzana(id: number, data: UpdateManzanaDTO) {
		if (isNaN(id) || id <= 0)
			throw new AppError("ID de manzana inválido", 400);
		if (data.codigo !== undefined && data.codigo.trim() === "") {
			throw new AppError(
				"El código de la manzana no puede estar vacío",
				400,
			);
		}

		const payload = data.codigo
			? { ...data, codigo: data.codigo.toUpperCase() }
			: data;
		return this.repo.updateManzana(id, payload);
	}

	async deleteManzana(id: number) {
		if (isNaN(id) || id <= 0) throw new AppError("ID de manzana inválido", 400);
		return this.repo.softDeleteManzana(id);
	}
}
