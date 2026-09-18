import { PrismaClient, Prisma, EstadoCita } from "generated/prisma/client";
import { IAppointmentsRepository } from "../../application/ports/IAppointmentsRepository";
import {
	CreateAppointmentDTO,
	GetAppointmentsQueryDTO,
	UpdateAppointmentDTO,
} from "../../domain/dtos";
import { generateNestedSearchCondition } from "@/shared/utils/prismaSearch";

export class PrismaAppointmentsRepository implements IAppointmentsRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findPaginated(query: GetAppointmentsQueryDTO) {
		const {
			page,
			limit,
			estado_cita,
			fecha_inicio,
			fecha_fin,
			puntuacion,
			id_proyecto,
			id_usuario_responsable,
			q
		} = query;
		const skip = (page - 1) * limit;

		const where: Prisma.CitasWhereInput = {};
		if (estado_cita) where.estado_cita = estado_cita;
		if (puntuacion) where.puntuacion_cliente = puntuacion;
		if (id_proyecto) where.id_proyecto = id_proyecto;
		if (id_usuario_responsable)
			where.id_usuario_responsable = id_usuario_responsable;

		if (fecha_inicio && fecha_fin) {
			where.fecha_cita = {
				gte: new Date(fecha_inicio),
				lte: new Date(fecha_fin),
			};
		}

		if (q && q.trim() !== "") {
			where.AND = generateNestedSearchCondition(q, (word) => [
				{ persona: { nombres: { contains: word, mode: "insensitive" } } },
				{ persona: { apellidos: { contains: word, mode: "insensitive" } } },
				{ persona: { numero: { contains: word, mode: "insensitive" } } },
				{ persona: { email: { contains: word, mode: "insensitive" } } },
				{ asesor: { nombres: { contains: word, mode: "insensitive" } } },
				{ asesor: { apellidos: { contains: word, mode: "insensitive" } } },
				{ asesor: { email: { contains: word, mode: "insensitive" } } },
				{ observaciones_visita: { contains: word, mode: "insensitive" } },
			]);
		}

		const [total, data] = await Promise.all([
			this.prisma.citas.count({ where }),
			this.prisma.citas.findMany({
				where,
				skip,
				take: limit,
				orderBy: { fecha_cita: "desc" },
				include: {
					persona: {
						select: {
							id: true,
							nombres: true,
							apellidos: true,
							email: true,
							telefonos: true,
							sexo: true,
							es_peruano: true,
							nacionalidad: true,
							direccion: true,
							numero: true,
						},
					},
					asesor: {
						select: {
							nombres: true,
							apellidos: true,
							email: true,
							telefono: true,
							estado: true,
							rol: {
								select: {
									nombre: true,
								},
							},
						},
					},
					proyecto: {
						select: {
							id: true,
							nombre: true,
							abreviatura: true,
							ubicacion: true,
							descripcion: true,
						},
					},
					lote: true,
				},
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data,
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

	async findById(id: number) {
		return this.prisma.citas.findUnique({
			where: { id },
			include: {
				persona: {
					select: {
						id: true,
						nombres: true,
						apellidos: true,
						email: true,
						telefonos: true,
						sexo: true,
						es_peruano: true,
						nacionalidad: true,
						direccion: true,
						numero: true,
					},
				},
				asesor: {
					select: {
						nombres: true,
						apellidos: true,
						email: true,
						telefono: true,
						estado: true,
						rol: {
							select: {
								nombre: true,
							},
						},
					},
				},
				proyecto: {
					select: {
						id: true,
						nombre: true,
						abreviatura: true,
						ubicacion: true,
						descripcion: true,
					},
				},
				lote: true,
			},
		});
	}

	async findConflictingAppointments(
		fecha_cita: Date,
		hora_cita: Date,
		id_lote?: number | null,
		id_usuario_responsable?: string,
		excludeCitaId?: number,
	) {
		const OR_conditions: Prisma.CitasWhereInput[] = [];
		if (id_lote) OR_conditions.push({ id_lote });
		if (id_usuario_responsable)
			OR_conditions.push({ id_usuario_responsable });
		const where: Prisma.CitasWhereInput = {
			fecha_cita,
			hora_cita,
			estado_cita: { not: EstadoCita.CANCELADA },
			...(OR_conditions.length > 0 ? { OR: OR_conditions } : {}),
			...(excludeCitaId ? { id: { not: excludeCitaId } } : {}),
		};
		return this.prisma.citas.findMany({ where });
	}

	async create(
	data: CreateAppointmentDTO,
	parsedFecha: Date,
	parsedHora: Date,
) {
	return this.prisma.$transaction(async (tx) => {
		let personaId: number;

		if (data.id_cliente) {
			personaId = data.id_cliente;
		} else if (data.nuevo_lead) {
			const {
				telefonos,
				id_tipo_doc_identidad,
				id_ubigeo,
				...clienteData
			} = data.nuevo_lead;
			const nuevaPersona = await tx.personas.create({
				data: {
					numero: clienteData.numero,
					tipo_doc: { connect: { id: id_tipo_doc_identidad } },
					nombres: clienteData.nombres || null,
					apellidos: clienteData.apellidos || null,
					email: clienteData.email?.toLowerCase() || null,
					sexo: clienteData.sexo || null,
					estado_civil: clienteData.estado_civil || null,
					es_peruano: clienteData.es_peruano ?? true,
					nacionalidad: clienteData.nacionalidad || null,
					direccion: clienteData.direccion || null,
					ocupacion: clienteData.ocupacion || null,
					...(id_ubigeo ? { ubigeo: { connect: { id: id_ubigeo } } } : {}),
					...(telefonos && telefonos.length > 0
						? { telefonos: { create: telefonos } }
						: {}),
				},
			});

			personaId = nuevaPersona.id;

			await tx.leads.create({
				data: {
					id_persona: personaId,
					estado: "NUEVO", 
					id_asesor: data.id_usuario_responsable, 
				},
			});
		} else {
			throw new Error("Debe proporcionar un id_cliente existente o los datos para un nuevo_lead.");
		}

		const createPayload: Prisma.CitasCreateInput = {
			fecha_cita: parsedFecha,
			hora_cita: parsedHora,
			estado_cita: EstadoCita.PROGRAMADA,
			proyecto: { connect: { id: data.id_proyecto } },
			asesor: { connect: { id: data.id_usuario_responsable } },
			persona: { connect: { id: personaId } },
			...(data.id_lote ? { lote: { connect: { id: data.id_lote } } } : {}),
			...(data.observaciones_visita ? { observaciones_visita: data.observaciones_visita } : {}),
		};

		return tx.citas.create({ data: createPayload });
	});
}

	async update(
		id: number,
		data: UpdateAppointmentDTO,
		parsedFecha?: Date,
		parsedHora?: Date,
	) {
		const {
			id_proyecto,
			id_lote,
			id_usuario_responsable,
			puntuacion_cliente,
			estado_cita,
			observaciones_visita,
		} = data;

		const updatePayload: Prisma.CitasUpdateInput = {};

		if (estado_cita !== undefined) updatePayload.estado_cita = estado_cita;
		if (puntuacion_cliente !== undefined)
			updatePayload.puntuacion_cliente = puntuacion_cliente;
		if (observaciones_visita !== undefined)
			updatePayload.observaciones_visita = observaciones_visita;
		if (parsedFecha !== undefined) updatePayload.fecha_cita = parsedFecha;
		if (parsedHora !== undefined) updatePayload.hora_cita = parsedHora;

		if (id_proyecto !== undefined)
			updatePayload.proyecto = { connect: { id: id_proyecto } };
		if (id_usuario_responsable !== undefined)
			updatePayload.asesor = { connect: { id: id_usuario_responsable } };

		if (id_lote === null) updatePayload.lote = { disconnect: true };
		else if (id_lote !== undefined)
			updatePayload.lote = { connect: { id: id_lote } };

		return this.prisma.citas.update({ where: { id }, data: updatePayload });
	}

	async delete(id: number) {
		return this.prisma.citas.delete({ where: { id } });
	}
}
