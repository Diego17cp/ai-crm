import {
	PrismaClient,
	Prisma,
	EstadoCita,
	TipoPersona,
} from "generated/prisma/client";
import { IAppointmentsRepository } from "../../application/ports/IAppointmentsRepository";
import {
	CreateAppointmentDTO,
	GetAppointmentsQueryDTO,
	UpdateAppointmentDTO,
} from "../../domain/dtos";

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

		const [total, data] = await Promise.all([
			this.prisma.citas.count({ where }),
			this.prisma.citas.findMany({
				where,
				skip,
				take: limit,
				orderBy: { fecha_cita: "desc" },
				include: {
					cliente: {
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
                            solvencia: true,
                            numero: true,
                            actitud: true,
                        }
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
                                    nombre: true
                                }
                            }
                        }
                    },
					proyecto: {
                        select: {
                            id: true,
                            nombre: true,
                            abreviatura: true,
                            ubicacion: true,
                            descripcion: true,
                        }
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
                hasPreviousPage: page > 1
            },
		};
	}

	async findById(id: number) {
		return this.prisma.citas.findUnique({
			where: { id },
			include: {
                cliente: {
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
                        solvencia: true,
                        numero: true,
                        actitud: true,
                    }
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
                                nombre: true
                            }
                        }
                    }
                },
                proyecto: {
                    select: {
                        id: true,
                        nombre: true,
                        abreviatura: true,
                        ubicacion: true,
                        descripcion: true,
                    }
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
		if (id_usuario_responsable) OR_conditions.push({ id_usuario_responsable });
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
		const createPayload: Prisma.CitasCreateInput = {
			fecha_cita: parsedFecha,
			hora_cita: parsedHora,
			estado_cita: EstadoCita.PROGRAMADA,
			proyecto: { connect: { id: data.id_proyecto } },
			asesor: { connect: { id: data.id_usuario_responsable } },
			cliente: {} as any,
		};

		if (data.id_lote) createPayload.lote = { connect: { id: data.id_lote } };
		if (data.observaciones_visita) createPayload.observaciones_visita = data.observaciones_visita;
		if (data.id_cliente) createPayload.cliente.connect = { id: data.id_cliente };
		else if (data.nuevo_cliente) {
			const {
				telefonos,
				id_tipo_doc_identidad,
				id_ubigeo,
				...clienteData
			} = data.nuevo_cliente;
			createPayload.cliente.create = {
				numero: clienteData.numero,
				tipo_persona: TipoPersona.LEAD,
				tipo_doc: { connect: { id: id_tipo_doc_identidad } },
				nombres: clienteData.nombres || null,
				apellidos: clienteData.apellidos || null,
				email: clienteData.email?.toLowerCase() || null,
				...(id_ubigeo
					? { ubigeo: { connect: { id: id_ubigeo } } }
					: {}),
				...(telefonos && telefonos.length > 0
					? { telefonos: { create: telefonos } }
					: {}),
			};
		}
		return this.prisma.citas.create({ data: createPayload });
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
