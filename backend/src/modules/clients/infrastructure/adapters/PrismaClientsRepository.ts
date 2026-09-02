import { PrismaClient, Prisma } from "generated/prisma/client";
import {
	IClientsRepository,
	ClientWithRelationsDTO,
} from "../../application/ports/IClientsRepository";
import {
	CreateClientDTO,
	GetClientsQueryDTO,
	PaginatedClientsResult,
	UpdateClientDTO,
} from "../../domain/dtos";
import { IdentityResolverService } from "../../../../core/identity/IdentityResolverService";

export class PrismaClientsRepository implements IClientsRepository {
	private identityResolver: IdentityResolverService;

	constructor(private readonly prisma: PrismaClient) {
		this.identityResolver = new IdentityResolverService(this.prisma);
	}

	async findPaginated(
		queryDTO: GetClientsQueryDTO,
	): Promise<PaginatedClientsResult<ClientWithRelationsDTO>> {
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

		const whereCondition: Prisma.ClientesWhereInput = {};

		if (solvencia) whereCondition.solvencia = solvencia;
		if (actitud) whereCondition.actitud = actitud;

		const personaWhere: Prisma.PersonasWhereInput = {};
		let hasPersonaFilter = false;

		if (sexo) {
			personaWhere.sexo = sexo;
			hasPersonaFilter = true;
		}
		if (es_peruano !== undefined) {
			personaWhere.es_peruano = es_peruano;
			hasPersonaFilter = true;
		}
		if (estado_civil) {
			personaWhere.estado_civil = estado_civil;
			hasPersonaFilter = true;
		}

		if (q && q.trim() !== "") {
			hasPersonaFilter = true;
			personaWhere.OR = [
				{ nombres: { contains: q, mode: "insensitive" } },
				{ apellidos: { contains: q, mode: "insensitive" } },
				{ numero: { contains: q, mode: "insensitive" } },
				{ email: { contains: q, mode: "insensitive" } },
				{ direccion: { contains: q, mode: "insensitive" } },
				{
					telefonos: {
						some: { numero: { contains: q, mode: "insensitive" } },
					},
				},
			];
		}

		if (hasPersonaFilter) {
			whereCondition.persona = personaWhere;
		}

		const [total, data] = await Promise.all([
			this.prisma.clientes.count({ where: whereCondition }),
			this.prisma.clientes.findMany({
				where: whereCondition,
				skip,
				take: limit,
				orderBy: { created_at: "desc" },
				include: {
					persona: {
						include: {
							tipo_doc: true,
							ubigeo: true,
							telefonos: true,
						},
					},
				},
			}),
		]);

		const totalPages = Math.ceil(total / limit);
		return {
			data: data as ClientWithRelationsDTO[],
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
			where: { id },
			include: {
				persona: {
					include: {
						tipo_doc: true,
						ubigeo: true,
						telefonos: true,
					},
				},
			},
		}) as Promise<ClientWithRelationsDTO | null>;
	}

	async findByDocument(
		idTipoDoc: number,
		numero: string,
	): Promise<ClientWithRelationsDTO | null> {
		return this.prisma.clientes.findFirst({
			where: {
				persona: {
					id_tipo_doc: idTipoDoc,
					numero: numero,
				},
			},
			include: {
				persona: {
					include: {
						telefonos: true,
						tipo_doc: true,
						ubigeo: true,
					},
				},
			},
		}) as Promise<ClientWithRelationsDTO | null>;
	}

	async findPhonesInUse(
		numeros: string[],
		excludePersonaId?: number,
	): Promise<string[]> {
		if (numeros.length === 0) return [];
		const foundPhones = await this.prisma.telefonosPersona.findMany({
			where: {
				numero: { in: numeros },
				...(excludePersonaId
					? { id_persona: { not: excludePersonaId } }
					: {}),
			},
			select: { numero: true },
		});
		return foundPhones
			.map((t) => t.numero)
			.filter((numero): numero is string => numero !== null);
	}

	async create(data: CreateClientDTO) {
		return this.prisma.$transaction(async (tx) => {
			// Resolve persona first
			const persona = await this.identityResolver.resolveIdentity(
				{
					id_tipo_doc: data.id_tipo_doc_identidad,
					numero: data.numero,
					nombres: data.nombres ?? null,
					apellidos: data.apellidos ?? null,
					fecha_nacimiento: data.fecha_nacimiento ?? null,
					sexo: data.sexo ?? null,
					estado_civil: data.estado_civil ?? null,
					es_peruano: data.es_peruano ?? true,
					nacionalidad: data.nacionalidad ?? null,
					direccion: data.direccion ?? null,
					email: data.email ?? null,
					ocupacion: data.ocupacion ?? null,
					id_ubigeo: data.id_ubigeo ?? null,
					telefonos: data.telefonos ?? [],
				},
				tx,
			);

			// Create client
			return tx.clientes.create({
				data: {
					persona: { connect: { id: persona.id } },
					...(data.solvencia ? { solvencia: data.solvencia } : {}),
					...(data.actitud ? { actitud: data.actitud } : {}),
				},
			});
		});
	}

	async update(id: number, data: UpdateClientDTO) {
		return this.prisma.$transaction(async (tx) => {
			const cliente = await tx.clientes.findUnique({
				where: { id },
				include: { persona: true },
			});
			if (!cliente) throw new Error("Cliente no encontrado");

			// Extract persona update fields
			const {
				nombres,
				apellidos,
				fecha_nacimiento,
				sexo,
				estado_civil,
				es_peruano,
				nacionalidad,
				direccion,
				email,
				ocupacion,
				id_ubigeo,
				telefonos,
				// client fields
				solvencia,
				actitud,
			} = data;

			const updatePersonaPayload: Prisma.PersonasUpdateInput = {};
			if (nombres !== undefined) updatePersonaPayload.nombres = nombres;
			if (apellidos !== undefined)
				updatePersonaPayload.apellidos = apellidos;
			if (fecha_nacimiento !== undefined)
				updatePersonaPayload.fecha_nacimiento = fecha_nacimiento;
			if (sexo !== undefined) updatePersonaPayload.sexo = sexo;
			if (estado_civil !== undefined)
				updatePersonaPayload.estado_civil = estado_civil;
			if (es_peruano !== undefined)
				updatePersonaPayload.es_peruano = es_peruano ?? true;
			if (nacionalidad !== undefined)
				updatePersonaPayload.nacionalidad = nacionalidad;
			if (direccion !== undefined)
				updatePersonaPayload.direccion = direccion;
			if (email !== undefined) updatePersonaPayload.email = email;
			if (ocupacion !== undefined)
				updatePersonaPayload.ocupacion = ocupacion;
			if (id_ubigeo !== undefined)
				updatePersonaPayload.ubigeo = id_ubigeo
					? { connect: { id: id_ubigeo } }
					: { disconnect: true };

			if (telefonos) {
				updatePersonaPayload.telefonos = {};
				if (telefonos.add && telefonos.add.length > 0)
					updatePersonaPayload.telefonos.create = telefonos.add;
				if (telefonos.remove && telefonos.remove.length > 0)
					updatePersonaPayload.telefonos.deleteMany = {
						id: { in: telefonos.remove },
					};
				if (telefonos.update && telefonos.update.length > 0) {
					updatePersonaPayload.telefonos.update =
						telefonos.update.map((t) => ({
							where: { id: t.id },
							data: {
								...(t.numero !== undefined
									? { numero: t.numero }
									: {}),
								...(t.tipo !== undefined
									? { tipo: t.tipo }
									: {}),
							},
						}));
				}
				if (Object.keys(updatePersonaPayload.telefonos).length === 0)
					delete updatePersonaPayload.telefonos;
			}

			if (Object.keys(updatePersonaPayload).length > 0) {
				await tx.personas.update({
					where: { id: cliente.id_persona },
					data: updatePersonaPayload,
				});
			}

			const updateClientPayload: Prisma.ClientesUpdateInput = {};
			if (solvencia !== undefined)
				updateClientPayload.solvencia = solvencia;
			if (actitud !== undefined) updateClientPayload.actitud = actitud;

			if (Object.keys(updateClientPayload).length > 0) {
				return tx.clientes.update({
					where: { id },
					data: updateClientPayload,
				});
			}

			return cliente;
		});
	}

	async delete(id: number) {
		return this.prisma.$transaction(async (tx) => {
			await tx.citas.deleteMany({
				where: { clientesId: id },
			});
			return tx.clientes.delete({
				where: { id },
			});
		});
	}

	async hasSalesOrDebts(id: number): Promise<boolean> {
		const salesCount = await this.prisma.ventas.count({
			where: { id_cliente: id },
		});
		return salesCount > 0;
	}
}
