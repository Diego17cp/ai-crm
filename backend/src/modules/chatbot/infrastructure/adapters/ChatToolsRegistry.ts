import { PrismaClient } from "generated/prisma/client";
import { IToolsRegistry } from "../../application/ports/IToolsRegistry";
import { LotesWhereInput } from "generated/prisma/models";

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
					description: "Busca lotes disponibles. Puede buscar por proyecto y/o por un área aproximada en metros cuadrados (m2).",
					parameters: {
						type: "object",
						properties: {
							nombre_proyecto: {
								type: "string",
								description:
									"El nombre del proyecto (ej: Santa Rosa)",
							},
							area_aproximada_m2: {
								type: "number",
								description: "El tamaño aproximado del lote en metros cuadrados, ej: 120. Úsalo para filtrar lotes disponibles que tengan un área similar a la indicada por el usuario. Si el usuario no da esta información, no apliques este filtro y muestra lotes de todos los tamaños."
							}
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
						"Guarda al interesado como prospecto (Lead) deduciendo apellidos y sexo del nombre proporcionado, y agenda una visita. La fecha DEBE ser futura (YYYY-MM-DD). La hora en formato HH:MM (24 horas). EXIGE que el bot primero pida el teléfono y el nombre del cliente. El email es opcional. Úsalo SOLO cuando el cliente muestre clara intención de compra o diga que quiere ir a ver el proyecto.",
					parameters: {
						type: "object",
						properties: {
							nombres: { type: "string", description: "Solo los nombre(s) de pila" },
							apellidos: {  type: "string", description: "Solo los apellido(s), si el usuario los dio por separado. Si no, infiérelo del nombre completo." },
							sexo: { type: "string", enum: ["M", "F"], description: "M o F, infiere esto basándote estrictamente en el nombre de pila del cliente." },
							telefono: { type: "string" },
							email: { type: "string" },
							fecha_esperada: {
								type: "string",
								description:
									"Fecha en formato DD/MM/AAAA o similar, es decir, día, mes y año. Ejemplo: 25/12/2024",
							},
							hora_esperada: {
								type: "string",
								description:
									"Hora en formato HH:MM (24 horas). Ejemplo: 16:30",
							},
							nombre_proyecto: {
								type: "string",
								description:
									"Nombre del proyecto que el cliente quiere visitar, ej: Santa Rosa",
							},
						},
                        required: ["nombres", "apellidos", "sexo", "telefono", "fecha_esperada", "hora_esperada"],
					},
				},
			},
			{
				type: "function",
				function: {
					name: "solicitar_asistencia_humana",
					description:
						"Usa esta herramienta para marcar la conversación como que requiere asistencia humana. Solo debes usarla si el cliente exige reiteradamente o pide explícitamente 'hablar con un humano' o un 'asesor de verdad', y sientes que su frustración va en aumento. No la uses solo porque el cliente hizo una pregunta difícil o pidió algo que no entiendes, solo úsala si el cliente claramente quiere ser atendido por una persona real.",
					parameters: { type: "object", properties: {} },
				}
			}
			// Podrías añadir "consultar_deuda_cliente(dni)" o "agendar_cita(fecha)"
		];
	}

	async executeTool(name: string, args: any, conversacionId?: string): Promise<any> {
		switch (name) {
			case "buscar_proyectos":
				return await this.buscarProyectos();
			case "buscar_lotes_disponibles":
				return await this.buscarLotesDisponibles(args);
			case "calcular_financiamiento_lote":
				return await this.calcularFinanciamientoLote(args);
			case "agendar_cita_y_registrar_prospecto":
				return await this.agendarCita(args, conversacionId);
			case "solicitar_asistencia_humana":
				return await this.derivarHumano(conversacionId)
			default:
				throw new Error(`Tool ${name} no existe`);
		}
	}

	private async derivarHumano(conversacionId?: string) {
		if (!conversacionId) return { message: "No se pudo marcar la conversación para asistencia humana porque no se proporcionó un ID de conversación válido." };
		await this.prisma.conversaciones.update({
			where: { id: conversacionId },
			data: {
				estado: "ESPERANDO_ASESOR"
			}
		});
		// TODO: Emitir websocket para notificar a los asesores en tiempo real que hay una conversación que requiere atención.
		return {
			prompt_result: "Transfiriendo a un asesor humano. Dile al cliente que un ejecutivo leerá la conversación y le responderá en breve. Despídete amablemente, tu labor ha terminado aquí."
		}
	}

	private async buscarLotesDisponibles(args: { nombre_proyecto?: string, area_aproximada_m2?: number }) {
		let whereCondition: LotesWhereInput = { estado: "Disponible" }
		if (args.nombre_proyecto) whereCondition.manzana = { etapa: { proyecto: { nombre: { contains: args.nombre_proyecto, mode: "insensitive" } } } }
		if (args.area_aproximada_m2) {
			const min = args.area_aproximada_m2 * 0.8; // 20% menos
			const max = args.area_aproximada_m2 * 1.2; // 20% más
			whereCondition.area_m2 = { gte: min, lte: max }
		}
		const lotes = await this.prisma.lotes.findMany({
			where: whereCondition,
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
            orderBy: args.area_aproximada_m2 ? { area_m2: "asc" } : { precio_total: "asc" }
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
		apellidos: string;
		sexo: "M" | "F";
		telefono: string;
		email?: string;
		fecha_esperada: string;
		hora_esperada: string;
		nombre_proyecto?: string;
	}, conversacionId?: string) {
		try {
			const inputDateStr = `${args.fecha_esperada}T${args.hora_esperada}:00.000-05:00`;
			const targetDate = new Date(inputDateStr);
			if (targetDate < new Date()) return {
				error_humano: "Has intentado agendar en una fecha u hora que ya pasó. Por favor, pide al cliente que te indique una fecha y hora futuras para agendar la cita."
			};
			const asesor = await this.prisma.usuarios.findFirst({
				where: { estado: "ACTIVO", rol: { is: { nombre: "VENDEDOR" } } },
			})
			if (!asesor) throw new Error("No hay asesores disponibles para asignar la cita.");
			const parsedCitaFecha = new Date(args.fecha_esperada + "T00:00:00.000Z");
			const parsedCitaHora = new Date("1970-01-01T" + args.hora_esperada + ":00.000Z");
			const colision = await this.prisma.citas.findFirst({
				where: {
					id_usuario_responsable: asesor.id,
					fecha_cita: parsedCitaFecha,
					hora_cita: parsedCitaHora,
					estado_cita:{ not:"CANCELADA" }
				}
			});
			if (colision) return { error_humano: "El asesor ya tiene una cita ocupada a esa hora exacta. Pídele al usuario que elija un horario distinto, por ejemplo 30 mins o 1 hora más tarde."};

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
						apellidos: args.apellidos,
						sexo: args.sexo,
						email: args.email ?? null,
						telefonos: {
							create: { numero: args.telefono, tipo: "PERSONAL" },
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
			if (asesor && proyectoId && args.fecha_esperada) {
				await this.prisma.citas.create({
					data: {
						id_cliente: clienteId,
						id_proyecto: proyectoId,
						id_usuario_responsable: asesor.id,
						fecha_cita: parsedCitaFecha,
						hora_cita: parsedCitaHora,
						observaciones_visita: "Agendada vía chatbot, pendiente confirmar detalles con el cliente.",
						estado_cita: "PROGRAMADA"
					}
				});
			}
			return { prompt_result: "Prospecto registrado y cita separada con éxito. Agradécele utilizando su nombre, e indícale la fecha y hora que ha quedado reservada." };
		} catch (error) {
			console.error("Error al agendar cita:", error);
            return { prompt_result: "Hubo un error del sistema al agendar. Dile al usuario que lo intente nuevamente o pida hablar con un asesor." };
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
