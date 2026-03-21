import { PrismaClient, EstadoGeneral, Prisma, Manzanas } from "generated/prisma/client";
import { IProyectosRepository, ProyectoWithDetails } from "../../application/ports/IProyectosRepository";
import { CreateManzanaDTO, CreateManzanasBatchDTO, GetProyectosQueryDTO, PaginatedResult } from "../../domain/dtos";

export class PrismaProyectosRepository implements IProyectosRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findPaginated(queryDTO: GetProyectosQueryDTO): Promise<PaginatedResult<ProyectoWithDetails>> {
        const { q, page, limit } = queryDTO;
        const skip = (page - 1) * limit;

        const whereCondition: Prisma.ProyectosWhereInput = {
            estado: EstadoGeneral.ACTIVO
        };
        if (q && q.trim() !== "") {
            whereCondition.OR = [
                { nombre: { contains: q, mode: 'insensitive' } },
                { abreviatura: { contains: q, mode: 'insensitive' } },
                {
                    etapas: {
                        some: {
                            nombre: { contains: q, mode: 'insensitive' },
                            estado: EstadoGeneral.ACTIVO
                        }
                    }
                },
                {
                    etapas: {
                        some: {
                            estado: EstadoGeneral.ACTIVO,
                            manzanas: {
                                some: {
                                    codigo: { contains: q, mode: 'insensitive' },
                                    estado: EstadoGeneral.ACTIVO
                                }
                            }
                        }
                    }
                }
            ];
        }
        const [total, data] = await Promise.all([
            this.prisma.proyectos.count({ where: whereCondition }),
            this.prisma.proyectos.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    etapas: {
                        where: { estado: EstadoGeneral.ACTIVO },
                        include: {
                            manzanas: {
                                where: { estado: EstadoGeneral.ACTIVO }
                            }
                        }
                    },
                    ubigeo: {
                        select: {
                            nombre: true
                        }
                    }
                }
            })
        ]);
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        };
    }

    async findById(id: number): Promise<ProyectoWithDetails | null> {
        return this.prisma.proyectos.findUnique({
            where: { id },
            include: {
                etapas: {
                    include: { manzanas: true }
                },
                ubigeo: {
                    select: { nombre: true }
                }
            }
        });
    }

    // Ya no requeriremos findAll() ni query() porque han sido unificados en findPaginated()
    
    async create(data: any) {
        return this.prisma.proyectos.create({
            data: { ...data, estado: EstadoGeneral.ACTIVO }
        });
    }

    async update(id: number, data: any) {
        return this.prisma.proyectos.update({
            where: { id },
            data
        });
    }

    async softDelete(id: number) {
        return this.prisma.proyectos.update({
            where: { id },
            data: { estado: EstadoGeneral.INACTIVO }
        });
    }

    async createEtapa(data: any) {
        return this.prisma.etapas.create({
            data: { ...data, estado: EstadoGeneral.ACTIVO }
        });
    }

    async updateEtapa(id: number, data: any) {
        return this.prisma.etapas.update({ where: { id }, data });
    }

    async softDeleteEtapa(id: number) {
        return this.prisma.etapas.update({
            where: { id },
            data: { estado: EstadoGeneral.INACTIVO }
        });
    }

    async createManzana(data: CreateManzanaDTO): Promise<Manzanas> {
        return this.prisma.manzanas.create({
            data: { ...data, estado: EstadoGeneral.ACTIVO }
        });
    }
    async createManzanasBatch(data: CreateManzanasBatchDTO): Promise<number> {
        const payload = data.codigos.map(codigo => ({
            id_etapa: data.id_etapa,
            codigo,
            estado: EstadoGeneral.ACTIVO
        }));
        const result = await this.prisma.manzanas.createMany({
            data: payload,
            skipDuplicates: true
        })
        return result.count;
    }

    async updateManzana(id: number, data: any) {
        return this.prisma.manzanas.update({ where: { id }, data });
    }

    async softDeleteManzana(id: number) {
        return this.prisma.manzanas.update({
            where: { id },
            data: { estado: EstadoGeneral.INACTIVO }
        });
    }
}