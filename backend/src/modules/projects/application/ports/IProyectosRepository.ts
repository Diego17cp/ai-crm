import { Proyectos, Etapas, Manzanas } from "generated/prisma/client";
import {
	CreateProyectoDTO,
	UpdateProyectoDTO,
	CreateEtapaDTO,
	UpdateEtapaDTO,
	CreateManzanaDTO,
	UpdateManzanaDTO,
	GetProyectosQueryDTO,
	PaginatedResult,
	CreateManzanasBatchDTO,
} from "../../domain/dtos";

export type ProyectoWithDetails = Proyectos & {
	etapas: (Etapas & { manzanas: Manzanas[] })[];
} & {
    ubigeo: {
        nombre: string;
    };
};

export interface IProyectosRepository {
	findPaginated(query: GetProyectosQueryDTO): Promise<PaginatedResult<ProyectoWithDetails>>;
	findAll(): Promise<Proyectos[]>;
	findById(id: number): Promise<ProyectoWithDetails | null>;
	create(data: CreateProyectoDTO): Promise<Proyectos>;
	update(id: number, data: UpdateProyectoDTO): Promise<Proyectos>;
	softDelete(id: number): Promise<Proyectos>;

	createEtapa(data: CreateEtapaDTO): Promise<Etapas>;
	updateEtapa(id: number, data: UpdateEtapaDTO): Promise<Etapas>;
	softDeleteEtapa(id: number): Promise<Etapas>;
	findAllEtapas(): Promise<Etapas[]>;
	findEtapasByProyectoId(id_proyecto: number): Promise<Etapas[]>;

	createManzana(data: CreateManzanaDTO): Promise<Manzanas>;
	createManzanasBatch(data: CreateManzanasBatchDTO): Promise<number>;
	updateManzana(id: number, data: UpdateManzanaDTO): Promise<Manzanas>;
	softDeleteManzana(id: number): Promise<Manzanas>;
	findAllManzanas(): Promise<Manzanas[]>;
	findManzanasByEtapaId(id_etapa: number): Promise<Manzanas[]>;
}
