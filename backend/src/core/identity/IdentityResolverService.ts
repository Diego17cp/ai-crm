import {
	PrismaClient,
	Prisma,
	Personas,
	TipoTelefono,
	SexoPersona,
	EstadoCivil,
} from "generated/prisma/client";

export interface TelefonoData {
	numero: string;
	tipo: TipoTelefono;
}

export interface ResolveIdentityDTO {
	id_tipo_doc: number;
	numero: string;

	nombres?: string | null;
	apellidos?: string | null;
	fecha_nacimiento?: Date | null;
	sexo?: SexoPersona | null;
	estado_civil?: EstadoCivil | null;

	es_peruano?: boolean | null;
	nacionalidad?: string | null;
	direccion?: string | null;
	email?: string | null;
	ocupacion?: string | null;

	id_ubigeo?: string | null;

	telefonos?: TelefonoData[];
}

export class IdentityResolverService {
	constructor(private readonly prisma: PrismaClient) {}
	async resolveIdentity(
		data: ResolveIdentityDTO,
		tx?: Prisma.TransactionClient,
	): Promise<Personas> {
		const client = tx || this.prisma;

		const existingPersona = await client.personas.findUnique({
			where: {
				id_tipo_doc_numero: {
					id_tipo_doc: data.id_tipo_doc,
					numero: data.numero,
				},
			},
			include: {
				telefonos: true,
			},
		});
		if (existingPersona) {
			const updateData: Prisma.PersonasUpdateInput = {};

			const setIfProvided = (
				key: keyof Prisma.PersonasUpdateInput,
				value: any,
			) => {
				if (value !== undefined && value !== null) {
					(updateData as any)[key] = value;
				}
			};

			setIfProvided("nombres", data.nombres);
			setIfProvided("apellidos", data.apellidos);
			setIfProvided("fecha_nacimiento", data.fecha_nacimiento);
			setIfProvided("sexo", data.sexo);
			setIfProvided("estado_civil", data.estado_civil);
			setIfProvided("es_peruano", data.es_peruano);
			setIfProvided("nacionalidad", data.nacionalidad);
			setIfProvided("direccion", data.direccion);
			setIfProvided("email", data.email);
			setIfProvided("ocupacion", data.ocupacion);

			if (data.id_ubigeo !== undefined && data.id_ubigeo !== null) {
				updateData.ubigeo = { connect: { id: data.id_ubigeo } };
			}

			if (data.telefonos && data.telefonos.length > 0) {
				const existingPhoneNumbers = new Set(
					existingPersona.telefonos.map((t) => t.numero),
				);
				const newPhones = data.telefonos.filter(
					(t) => !existingPhoneNumbers.has(t.numero),
				);

				if (newPhones.length > 0) {
					updateData.telefonos = {
						create: newPhones,
					};
				}
			}

			if (Object.keys(updateData).length > 0) {
				return client.personas.update({
					where: { id: existingPersona.id },
					data: updateData,
				});
			}
			return existingPersona;
		}

		return client.personas.create({
			data: {
				tipo_doc: { connect: { id: data.id_tipo_doc } },
				numero: data.numero,
				...(data.nombres && { nombres: data.nombres }),
				...(data.apellidos && { apellidos: data.apellidos }),
				...(data.fecha_nacimiento && {
					fecha_nacimiento: data.fecha_nacimiento,
				}),
				...(data.sexo && { sexo: data.sexo }),
				...(data.estado_civil && { estado_civil: data.estado_civil }),
				...(data.es_peruano !== undefined &&
					data.es_peruano !== null && {
						es_peruano: data.es_peruano,
					}),
				...(data.nacionalidad && { nacionalidad: data.nacionalidad }),
				...(data.direccion && { direccion: data.direccion }),
				...(data.email && { email: data.email }),
				...(data.ocupacion && { ocupacion: data.ocupacion }),
				...(data.id_ubigeo && {
					ubigeo: { connect: { id: data.id_ubigeo } },
				}),
				...(data.telefonos &&
					data.telefonos.length > 0 && {
						telefonos: {
							create: data.telefonos,
						},
					}),
			},
		});
	}
	async resolveOrCreateByPhone(
		data: {
			telefono: string;
			nombres?: string | undefined;
			apellidos?: string | undefined;
			sexo?: SexoPersona | undefined;
			email?: string | undefined;
		},
		tx?: Prisma.TransactionClient,
	): Promise<Personas> {
		const client = tx || this.prisma;
		const telefonoExistente = await client.telefonosPersona.findUnique({
			where: { numero: data.telefono },
			include: { persona: true },
		});
		if (telefonoExistente) return telefonoExistente.persona;

		const persona = await client.personas.create({
			data: {
				nombres: data.nombres ?? null,
				apellidos: data.apellidos ?? null,
				sexo: data.sexo ?? null,
				email: data.email ?? null,
				telefonos: {
					create: {
						numero: data.telefono,
						tipo: TipoTelefono.PERSONAL,
					},
				},
			},
		});
		return persona;
	}
}
