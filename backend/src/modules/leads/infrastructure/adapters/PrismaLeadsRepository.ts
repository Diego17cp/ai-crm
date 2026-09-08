import { PrismaClient, Prisma, EstadoLead } from "generated/prisma/client";
import {
	ILeadsRepository,
	LeadWithRelationsDTO,
} from "../../application/ports/ILeadsRepository";
import {
	CreateLeadDTO,
	GetLeadsQueryDTO,
	PaginatedLeadsResult,
	UpdateLeadDTO,
} from "../../domain/dtos";
import { IdentityResolverService } from "../../../../core/identity/IdentityResolverService";

export class PrismaLeadsRepository implements ILeadsRepository {
	private identityResolver: IdentityResolverService;

	constructor(private readonly prisma: PrismaClient) {
		this.identityResolver = new IdentityResolverService(this.prisma);
	}

	async findPaginated(
		queryDTO: GetLeadsQueryDTO,
	): Promise<PaginatedLeadsResult<LeadWithRelationsDTO>> {
		const {
			q,
			page,
			limit,
			sexo,
			es_peruano,
			estado_civil,
			estado,
			id_asesor,
			id_proyecto,
		} = queryDTO;
		const skip = (page - 1) * limit;

		const whereCondition: Prisma.LeadsWhereInput = {};

		if (estado) whereCondition.estado = estado;
		if (id_asesor) whereCondition.id_asesor = id_asesor;
		if (id_proyecto) whereCondition.id_proyecto = id_proyecto;

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
			this.prisma.leads.count({ where: whereCondition }),
			this.prisma.leads.findMany({
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

	async findById(id: number): Promise<LeadWithRelationsDTO | null> {
		return this.prisma.leads.findFirst({
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
		}) as Promise<LeadWithRelationsDTO | null>;
	}

	async findByDocument(
		idTipoDoc: number,
		numero: string,
	): Promise<LeadWithRelationsDTO | null> {
		return this.prisma.leads.findFirst({
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
		}) as Promise<LeadWithRelationsDTO | null>;
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

	async create(data: CreateLeadDTO) {
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

			// Create lead
			return tx.leads.create({
				data: {
					persona: { connect: { id: persona.id } },
					...(data.id_asesor && {
						asesor: { connect: { id: data.id_asesor } },
					}),
					...(data.id_proyecto && {
						proyecto: { connect: { id: data.id_proyecto } },
					}),
					estado: data.estado || EstadoLead.NUEVO,
					...(data.origen ? { origen: data.origen } : {}),
				},
			});
		});
	}

	async update(id: number, data: UpdateLeadDTO) {
		return this.prisma.$transaction(async (tx) => {
			const lead = await tx.leads.findUnique({
				where: { id },
				include: { persona: true },
			});
			if (!lead) throw new Error("Lead no encontrado");

			// Extract persona update fields
			const {
				id_tipo_doc_identidad,
				numero,
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
				// lead fields
				id_asesor,
				id_proyecto,
				estado,
				origen,
				motivo_perdida,
				fecha_contacto,
				fecha_calificacion,
				fecha_cierre,
			} = data;

			const updatePersonaPayload: Prisma.PersonasUpdateInput = {};
			if (id_tipo_doc_identidad !== undefined)
				updatePersonaPayload.tipo_doc = {
					connect: { id: id_tipo_doc_identidad },
				};
			if (numero !== undefined) updatePersonaPayload.numero = numero;
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
					where: { id: lead.id_persona },
					data: updatePersonaPayload,
				});
			}

			const updateLeadPayload: Prisma.LeadsUpdateInput = {};
			if (id_asesor !== undefined)
				updateLeadPayload.asesor = id_asesor
					? { connect: { id: id_asesor } }
					: { disconnect: true };
			if (id_proyecto !== undefined)
				updateLeadPayload.proyecto = id_proyecto
					? { connect: { id: id_proyecto } }
					: { disconnect: true };
			if (estado !== undefined) updateLeadPayload.estado = estado;
			if (origen !== undefined) updateLeadPayload.origen = origen;
			if (motivo_perdida !== undefined)
				updateLeadPayload.motivo_perdida = motivo_perdida;
			if (fecha_contacto !== undefined)
				updateLeadPayload.fecha_contacto = fecha_contacto;
			if (fecha_calificacion !== undefined)
				updateLeadPayload.fecha_calificacion = fecha_calificacion;
			if (fecha_cierre !== undefined)
				updateLeadPayload.fecha_cierre = fecha_cierre;

			if (Object.keys(updateLeadPayload).length > 0) {
				return tx.leads.update({
					where: { id },
					data: updateLeadPayload,
				});
			}

			return lead;
		});
	}

	async delete(id: number) {
		return this.prisma.$transaction(async (tx) => {
			await tx.citas.deleteMany({
				where: { id_lead: id },
			});
			return tx.leads.delete({
				where: { id },
			});
		});
	}

	async hasSalesOrDebts(id: number): Promise<boolean> {
		const salesCount = await this.prisma.ventas.count({
			where: { id_lead: id },
		});
		return salesCount > 0;
	}
}
