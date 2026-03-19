import { PrismaClient } from "generated/prisma/client";
import { IToolsRegistry } from "../../application/ports/IToolsRegistry";

export class ChatToolsRegistry implements IToolsRegistry {
	constructor(private readonly prisma: PrismaClient) {}

	getToolsDefinition() {
		return [
			{
				type: "function",
				function: {
					name: "buscar_proyectos",
					description:
						"Busca los proyectos inmobiliarios o urbanizaciones generales que tiene la empresa. Úsalo cuando el usuario pregunte en general qué proyectos existen o dónde están ubicados antes de preguntar por un lote específico.",
					parameters: {
						type: "object",
						properties: {},
					},
				},
			},
			{
				type: "function",
				function: {
					name: "buscar_lotes_disponibles",
					description:
						"Busca lotes disponibles dentro de un proyecto. Retorna áreas, manzanas y precios.",
					parameters: {
						type: "object",
						properties: {
							nombre_proyecto: {
								type: "string",
								description:
									"El nombre del proyecto (ej: Santa Rosa)",
							},
						},
					},
				},
			},
			{
				type: "function",
				function: {
					name: "calcular_financiamiento_lote",
					description:
						"Calcula de manera simulada la inicial y las cuotas de un lote si el cliente quiere crédito.",
					parameters: {
						type: "object",
						properties: {
							precio_total: {
								type: "number",
								description: "Precio total del lote en soles",
							},
							meses: {
								type: "number",
								description:
									"Plazo en meses requeridos (usualmente 12, 18, 24, 36 o 48) (48 meses máximo)",
							},
						},
						required: ["precio_total", "meses"],
					},
				},
			},
			{
				type: "function",
				function: {
					name: "agendar_cita_y_registrar_prospecto",
					description:
						"Guarda al interesado como prospecto (Lead) y agenda una visita. EXIGE que el bot primero pida el teléfono y el nombre del cliente. El email es opcional. Úsalo SOLO cuando el cliente muestre clara intención de compra o diga que quiere ir a ver el proyecto.",
					parameters: {
						type: "object",
						properties: {
							nombres: { type: "string" },
							telefono: { type: "string" },
							email: { type: "string" },
							fecha_esperada: {
								type: "string",
								description:
									"Fecha en formato DD/MM/AAAA o similar, es decir, día, mes y año. Ejemplo: 25/12/2024",
							},
							nombre_proyecto: {
								type: "string",
								description:
									"Nombre del proyecto que el cliente quiere visitar, ej: Santa Rosa",
							},
						},
						required: ["nombres", "telefono", "fecha_esperada"],
					},
				},
			},
			// Podrías añadir "consultar_deuda_cliente(dni)" o "agendar_cita(fecha)"
		];
	}

	async executeTool(name: string, args: any): Promise<any> {
		switch (name) {
			case "buscar_proyectos":
				return await this.buscarProyectos();
			case "buscar_lotes_disponibles":
				return await this.buscarLotesDisponibles(args);
			case "calcular_financiamiento_lote":
				return await this.calcularFinanciamientoLote(args);
			case "agendar_cita_y_registrar_prospecto":
				return await this.agendarCita(args);
			default:
				throw new Error(`Tool ${name} no existe`);
		}
	}

	private async buscarLotesDisponibles(args: { nombre_proyecto?: string }) {
		const lotes = await this.prisma.lotes.findMany({
			where: {
				estado: "Disponible",
				...(args.nombre_proyecto
					? {
							manzana: {
								etapa: {
									proyecto: {
										nombre: {
											contains: args.nombre_proyecto,
											mode: "insensitive",
										},
									},
								},
							},
						}
					: {}),
			},
			select: {
				numero_lote: true,
				area_m2: true,
				precio_total: true,
				manzana: {
					select: {
						codigo: true,
						etapa: {
							select: { proyecto: { select: { nombre: true } } },
						},
					},
				},
			},
			take: 8,
		});
		return lotes;
	}

	private async calcularFinanciamientoLote(args: {
		precio_total: number;
		meses: number;
	}) {
		const cuotaInicialPorcentaje = 0.10;
		const inicial = args.precio_total * cuotaInicialPorcentaje;
		const saldo = args.precio_total - inicial;

		const tasa = 0; // no se aplica interes por ahora

		const cuotaMensual = tasa === 0 
            ? saldo / args.meses 
            : (saldo * tasa) / (1 - Math.pow(1 + tasa, -args.meses));


		return {
			precio_total: args.precio_total,
			cuota_inicial: Math.round(inicial),
			meses_a_pagar: args.meses,
			cuota_mensual_estimada: Math.round(cuotaMensual),
			nota: "Este es un cálculo referencial, los montos finales pueden variar según evaluación crediticia."
		}
	}

	private async agendarCita(args: {
		nombres: string;
		telefono: string;
		email?: string;
		fecha_esperada: string;
		nombre_proyecto?: string;
	}, conversacionId?: string) {
		try {
			let clienteId: number | undefined;
			const telefonoExistente = await this.prisma.telefonosCliente.findUnique({
				where: { numero: args.telefono },
				include: { cliente: true },
			})
			if (telefonoExistente) clienteId = telefonoExistente.id_cliente;
			else {
				const tipoDoc = await this.prisma.tipoDocIdentidad.findFirst();
				const nuevoCliente = await this.prisma.clientes.create({
					data: {
						id_tipo_doc_identidad: tipoDoc?.id || 1,
						numero: `LD-${Date.now().toString().slice(-8)}`,
						tipo_persona: "LEAD",
						nombres: args.nombres,
						email: args.email ?? null,
						telefonos: {
							create: { numero: args.telefono, tipo: "WHATSAPP" },
						}
					}
				});
				clienteId = nuevoCliente.id;
			}
			if (conversacionId && clienteId) {
				await this.prisma.conversaciones.update({
					where: { id: conversacionId },
					data: { id_cliente: clienteId },
				})
			}
			let proyectoId: number | undefined;
			if (args.nombre_proyecto) {
				const proyecto = await this.prisma.proyectos.findFirst({
					where: {
						nombre: {
							contains: args.nombre_proyecto,
							mode: "insensitive",
						}
					}
				})
				if (proyecto) proyectoId = proyecto.id;
			}
			const asesor = await this.prisma.usuarios.findFirst({
				where: { estado: "ACTIVO" },
			});
			if (asesor && proyectoId && args.fecha_esperada) {
				await this.prisma.citas.create({
					data: {
						id_cliente: clienteId,
						id_proyecto: proyectoId,
						id_usuario_responsable: asesor.id,
						fecha_cita: new Date(args.fecha_esperada.split("/").reverse().join("-")),
						observaciones_visita: "Agendada vía chatbot, pendiente confirmar detalles con el cliente.",
						estado_cita: "PROGRAMADA"
					}
				});
				return {
					prompt_result: "Prospecto registrado y cita agendada en la base de datos con éxito. Agradécele al cliente."
				}
			}
			return {
				prompt_result: "Se registró como lead, pero no se pudo generar la cita en el calendario porque faltan validar proyectos específicos o asesores. Avísale al cliente que lo contactarán enseguida."
			}
		} catch (error) {
			console.error("Error al agendar cita:", error);
			return {
				prompt_result: "Hubo un error al agendar la cita. Dile al cliente que aguarde un momento.",
			}
		}
	}

	private async buscarProyectos() {
		const proyectos = await this.prisma.proyectos.findMany({
			where: {
				estado: "ACTIVO",
			},
			select: {
				nombre: true,
				ubicacion: true,
				descripcion: true,
			},
		});
		if (proyectos.length === 0)
			return { message: "No hay proyectos activos en este momento." };
		return proyectos;
	}
}
