import { PrismaClient, TipoPersona, Prisma } from "generated/prisma/client";
import {
		IClientsRepository,
		ClientWithRelationsDTO,
	} from "../../application/ports/IClientsRepository";
import {
	CreateLeadDTO,
	GetLeadsQueryDTO,
	PaginatedLeadsResult,
	UpdateLeadDTO,
} from "@/modules/leads/domain/dtos";
import { LeadWithRelationsDTO } from "@/modules/leads/application/ports/ILeadsRepository";

export class PrismaClientsRepository implements IClientsRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findPaginated(
		queryDTO: GetLeadsQueryDTO,
	): Promise<PaginatedLeadsResult<ClientWithRelationsDTO>> {
		const {
			q,
			page,
			limit,
			sexo,
			es_peruano,
			estado_civil,
			solvencia,
			actitud,
		} = queryDTO;
		const skip = (page - 1) * limit;

		const whereCondition: Prisma.ClientesWhereInput = {
			tipo_persona: TipoPersona.CLIENTE,
		};

		if (sexo) whereCondition.sexo = sexo;
		if (es_peruano !== undefined) whereCondition.es_peruano = es_peruano;
		if (estado_civil) whereCondition.estado_civil = estado_civil;
		if (solvencia) whereCondition.solvencia = solvencia;
		if (actitud) whereCondition.actitud = actitud;

		if (q && q.trim() !== "") {
			whereCondition.OR = [
				{ nombres: { contains: q, mode: "insensitive" } },
				{ apellidos: { contains: q, mode: "insensitive" } },
				{ numero: { contains: q, mode: "insensitive" } },
				{ email: { contains: q, mode: "insensitive" } },
				{ direccion: { contains: q, mode: "insensitive" } },
				{
					telefonos: {
						some: {
							numero: { contains: q, mode: "insensitive" },
						},
					},
				},
			];
		}
		const [total, data] = await Promise.all([
			this.prisma.clientes.count({ where: whereCondition }),
			this.prisma.clientes.findMany({
				where: whereCondition,
				skip,
				take: limit,
				orderBy: {
					created_at: "desc",
				},
				include: {
					tipo_doc: true,
					ubigeo: true,
					telefonos: true,
				},
			}),
		]);
		const totalPages = Math.ceil(total / limit);
		return {
			data: data as LeadWithRelationsDTO[],
			meta: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		};
	}

	async findById(id: number): Promise<ClientWithRelationsDTO | null> {
		return this.prisma.clientes.findFirst({
			where: {
				id,
				tipo_persona: TipoPersona.CLIENTE,
			},
			include: {
				tipo_doc: true,
				ubigeo: true,
				telefonos: true,
			},
		});
	}

    async findByDocument(idTipoDoc: number, numero: string): Promise<ClientWithRelationsDTO | null> {
        return this.prisma.clientes.findFirst({
            where: {
                id_tipo_doc_identidad: idTipoDoc,
                numero: numero
            },
            include: {
                telefonos: true,
                tipo_doc: true,
                ubigeo: true
            }
        });
    }

	async findPhonesInUse(numeros: string[], excludeLeadId?: number): Promise<string[]> {
		if (numeros.length === 0) return [];
		const foundPhones = await this.prisma.telefonosCliente.findMany({
			where: {
				numero: { in: numeros },
				...(excludeLeadId ? { id_cliente: { not: excludeLeadId } } : {})
			},
			select: { numero: true }
		});
		return foundPhones.map(t => t.numero).filter((numero): numero is string => numero !== null);
	}

	async create(data: CreateLeadDTO) {
        const { telefonos, id_tipo_doc_identidad, id_ubigeo, ...clienteData } = data;

        const createPayload: Prisma.ClientesCreateInput = {
            numero: clienteData.numero,
            tipo_doc: { connect: { id: id_tipo_doc_identidad } },
            tipo_persona: TipoPersona.LEAD,
        };

        Object.entries(clienteData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'numero') (createPayload as any)[key] = value;
        });
        if (id_ubigeo !== undefined) createPayload.ubigeo = { connect: { id: id_ubigeo } };
        if (telefonos && telefonos.length > 0) {
            createPayload.telefonos = {
                create: telefonos,
            };
        }

        return this.prisma.clientes.create({
            data: createPayload,
        });
    }

	async update(id: number, data: UpdateLeadDTO) {
		const { telefonos, id_tipo_doc_identidad, id_ubigeo, ...clienteData } = data;

        const updatePayload: Prisma.ClientesUpdateInput = {};

        Object.entries(clienteData).forEach(([key, value]) => {
            if (value !== undefined) (updatePayload as any)[key] = value;
        });

        if (id_tipo_doc_identidad !== undefined) updatePayload.tipo_doc = { connect: { id: id_tipo_doc_identidad } };
        if (id_ubigeo !== undefined) updatePayload.ubigeo = { connect: { id: id_ubigeo } };

        if (telefonos) {
            updatePayload.telefonos = {};
            if (telefonos.add && telefonos.add.length > 0) updatePayload.telefonos.create = telefonos.add;
            if (telefonos.remove && telefonos.remove.length > 0) updatePayload.telefonos.deleteMany = { id: { in: telefonos.remove } };
            if (telefonos.update && telefonos.update.length > 0) {
                updatePayload.telefonos.update = telefonos.update.map(t => ({
                    where: { id: t.id },
                    data: {
                        ...(t.numero !== undefined ? { numero: t.numero } : {}),
                        ...(t.tipo !== undefined ? { tipo: t.tipo } : {}),
                    },
                }));
            }
            if (Object.keys(updatePayload.telefonos).length === 0) delete updatePayload.telefonos;
        }
        return this.prisma.clientes.update({
            where: { id },
            data: updatePayload,
        });
	}

	async delete(id: number) {
		return this.prisma.$transaction(async (tx) => {
            await tx.telefonosCliente.deleteMany({
                where: { id_cliente: id }
            });
			await tx.citas.deleteMany({
				where: { id_cliente: id }
			})
            return tx.clientes.delete({
                where: { id },
            });
        });
	}
	
	async hasSalesOrDebts(id: number): Promise<boolean> {
		const salesCount = await this.prisma.ventas.count({
			where: { id_cliente: id }
		});
		return salesCount > 0;
	}
}
