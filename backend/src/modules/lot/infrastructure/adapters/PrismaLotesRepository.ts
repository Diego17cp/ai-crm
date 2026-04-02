import { PrismaClient, EstadoLote, Prisma, Lotes } from "generated/prisma/client";
import { ILotesRepository, LoteWithRelationsDTO } from "../../application/ports/ILotesRepository";
import { CreateLoteDTO, GetLotesQueryDTO, PaginatedLotesResult, UpdateLoteDTO } from "../../domain/dtos";

export class PrismaLotesRepository implements ILotesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findPaginated(queryDTO: GetLotesQueryDTO): Promise<PaginatedLotesResult<LoteWithRelationsDTO>> {
        const { q, page, limit, id_proyecto, id_etapa, id_manzana, estado } = queryDTO;
        const skip = (page - 1) * limit;

        const whereCondition: Prisma.LotesWhereInput = {};
        if (estado) whereCondition.estado = estado;
        if (id_manzana) whereCondition.id_manzana = id_manzana;
        if (id_etapa) whereCondition.manzana = { id_etapa: id_etapa };
        if (id_proyecto) whereCondition.manzana = { etapa: { id_proyecto: id_proyecto } };

        if (q && q.trim() !== "") {
            whereCondition.OR = [
                { numero_lote: { contains: q, mode: 'insensitive' } },
                { numero_partida: { contains: q, mode: 'insensitive' } },
                {
                    manzana: {
                        codigo: { contains: q, mode: 'insensitive' }
                    }
                },
                {
                    manzana: {
                        etapa: {
                            nombre: { contains: q, mode: 'insensitive' }
                        }
                    }
                },
                {
                    manzana: {
                        etapa: {
                            proyecto: {
                                nombre: { contains: q, mode: 'insensitive' }
                            }
                        }
                    }
                }
            ];
        }
        const [total, data] = await Promise.all([
            this.prisma.lotes.count({ where: whereCondition }),
            this.prisma.lotes.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: {
                    id: 'desc'
                },
                include: {
                    imagenes: true,
                    manzana: {
                        select: {
                            codigo: true,
                            etapa: {
                                select: {
                                    nombre: true,
                                    proyecto: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: data as unknown as LoteWithRelationsDTO[],
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    async findById(id: number): Promise<LoteWithRelationsDTO | null> {
        return this.prisma.lotes.findFirst({
            where: { id },
            include: {
                imagenes: true,
                manzana: {
                    select: {
                        codigo: true,
                        etapa: {
                            select: {
                                nombre: true,
                                proyecto: {
                                    select: { nombre: true }
                                }
                            }
                        }
                    }
                }
            }
        }) as unknown as Promise<LoteWithRelationsDTO | null>;
    }

    async create(data: CreateLoteDTO): Promise<Lotes> {
        return this.prisma.lotes.create({
            data: {
                ...data,
                estado: data.estado || EstadoLote.Disponible
            }
        });
    }

    async update(id: number, data: UpdateLoteDTO): Promise<Lotes> {
        return this.prisma.lotes.update({
            where: { id },
            data
        });
    }

    async delete(id: number): Promise<any> {
        return this.prisma.lotes.delete({
            where: { id }
        });
    }

    async hasSales(id: number): Promise<boolean> {
        const salesCount = await this.prisma.ventas.count({
            where: { id_lote: id }
        });
        return salesCount > 0;
    }
}