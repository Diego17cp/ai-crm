import { EstadoChat, PrismaClient } from "generated/prisma/client";
import { IChatsRepository } from "../../application/ports/IChatsRepository";
import {
	GetChatsQueryDTO,
	PaginatedChatResults,
	ChatDTO,
	LiveChatQueueItemDTO,
	EventDTO,
	AsignacionDTO,
} from "../../domain/dtos";
import { ConversacionesWhereInput } from "generated/prisma/models";

export class PrismaChatsRepository implements IChatsRepository {
	constructor(private readonly prisma: PrismaClient) {}
	async findChats(
		query: GetChatsQueryDTO,
	): Promise<PaginatedChatResults<Omit<ChatDTO, "mensajes">>> {
		const { q, estado, canal, page, limit, id_asesor } = query;
		const skip = (page - 1) * limit;
		const whereCondition: ConversacionesWhereInput = {};
		if (q) {
			whereCondition.OR = [
				{ persona: { nombres: { contains: q, mode: "insensitive" } } },
				{
					persona: {
						apellidos: { contains: q, mode: "insensitive" },
					},
				},
				{ asesor: { nombres: { contains: q, mode: "insensitive" } } },
				{ asesor: { apellidos: { contains: q, mode: "insensitive" } } },
				{
					asesor: {
						rol: { nombre: { contains: q, mode: "insensitive" } },
					},
				},
			];
		}

		if (estado) whereCondition.estado = estado;
		if (canal) whereCondition.canal = canal;
		if (id_asesor) whereCondition.id_usuario_asignado = id_asesor;
		const [total, chats] = await Promise.all([
			this.prisma.conversaciones.count({ where: whereCondition }),
			this.prisma.conversaciones.findMany({
				where: whereCondition,
				skip,
				take: limit,
				orderBy: { updated_at: "desc" },
				include: {
					persona: {
						select: {
							id: true,
							nombres: true,
							apellidos: true,
						},
					},
					lead: {
						select: {
							id: true,
						},
					},
					asesor: {
						select: {
							id: true,
							nombres: true,
							apellidos: true,
							rol: {
								select: {
									id: true,
									nombre: true,
								},
							},
						},
					},
					mensajes: {
						take: 1,
						orderBy: { created_at: "desc" },
						select: { created_at: true },
					},
				},
			}),
		]);
		const totalPages = Math.ceil(total / limit);
		const data = chats.map((chat) => ({
			id: chat.id,
			cliente: chat.persona,
			asesor: chat.asesor,
			created_at: chat.created_at,
			last_message_at: chat.mensajes[0]?.created_at || null,
			estado: chat.estado,
			canal: chat.canal,
			lead: chat.lead,
			session_id: chat.session_id,
		}));
		data.sort(
			(a, b) =>
				(b.last_message_at?.getTime() ?? 0) -
				(a.last_message_at?.getTime() ?? 0),
		);
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
	async findChatById(chatId: string): Promise<ChatDTO | null> {
		const chat = await this.prisma.conversaciones.findUnique({
			where: { id: chatId },
			include: {
				persona: {
					select: {
						id: true,
						nombres: true,
						apellidos: true,
					},
				},
				asesor: {
					select: {
						id: true,
						nombres: true,
						apellidos: true,
						rol: {
							select: {
								id: true,
								nombre: true,
							},
						},
					},
				},
				lead: {
					select: {
						id: true,
					},
				},
				mensajes: {
					orderBy: { created_at: "asc" },
					select: {
						id: true,
						usuario: {
							select: {
								id: true,
								nombres: true,
								apellidos: true,
								rol: {
									select: {
										id: true,
										nombre: true,
									},
								},
							},
						},
						remitente: true,
						created_at: true,
						contenido: true,
						adjunto: true,
					},
				},
			},
		});
		if (!chat) return null;
		return {
			id: chat.id,
			cliente: chat.persona,
			asesor: chat.asesor,
			lead: chat.lead,
			created_at: chat.created_at,
			estado: chat.estado,
			canal: chat.canal,
			session_id: chat.session_id,
			mensajes: chat.mensajes as any,
			last_message_at: null,
		} as ChatDTO;
	}
	async findChatBySessionId(sessionId: string): Promise<ChatDTO | null> {
		const chat = await this.prisma.conversaciones.findFirst({
			where: { session_id: sessionId },
			include: {
				persona: {
					select: {
						id: true,
						nombres: true,
						apellidos: true,
					},
				},
				asesor: {
					select: {
						id: true,
						nombres: true,
						apellidos: true,
						rol: {
							select: {
								id: true,
								nombre: true,
							},
						},
					},
				},
				mensajes: {
					orderBy: { created_at: "asc" },
					select: {
						id: true,
						usuario: {
							select: {
								id: true,
								nombres: true,
								apellidos: true,
								rol: {
									select: {
										id: true,
										nombre: true,
									},
								},
							},
						},
						remitente: true,
						created_at: true,
						contenido: true,
						adjunto: true,
					},
				},
			},
		});
		if (!chat) return null;
		return {
			id: chat.id,
			cliente: chat.persona,
			asesor: chat.asesor,
			created_at: chat.created_at,
			estado: chat.estado,
			canal: chat.canal,
			session_id: chat.session_id,
			mensajes: chat.mensajes as any,
			last_message_at: null,
		} as ChatDTO;
	}
	async findLiveChatQueue(): Promise<LiveChatQueueItemDTO[]> {
		const chats = await this.prisma.conversaciones.findMany({
			where: { estado: "ESPERANDO_ASESOR" },
			orderBy: { created_at: "asc" },
			include: {
				persona: {
					select: {
						nombres: true,
						apellidos: true,
					},
				},
				mensajes: {
					take: 1,
					orderBy: { created_at: "desc" },
					select: {
						contenido: true,
						created_at: true,
					},
				},
			},
		});
		return chats.map((chat) => ({
			id: chat.id,
			nombre: chat.persona?.nombres
				? `${chat.persona.nombres} ${chat.persona.apellidos ?? ""}`.trim()
				: "Cliente anónimo",
			canal: chat.canal,
			lastMessage: chat.mensajes[0]?.contenido ?? "",
			createdAt: chat.mensajes[0]?.created_at ?? chat.created_at,
		}));
	}
	async findLiveActiveChats(
		idUsuario: string,
	): Promise<LiveChatQueueItemDTO[]> {
		const chats = await this.prisma.conversaciones.findMany({
			where: {
				id_usuario_asignado: idUsuario,
				estado: "ATENDIDO_HUMANO",
			},
			include: {
				persona: {
					select: {
						nombres: true,
						apellidos: true,
					},
				},
				mensajes: {
					take: 1,
					orderBy: { created_at: "desc" },
					select: {
						contenido: true,
						created_at: true,
					},
				},
			},
		});
		return chats.map((chat) => ({
			id: chat.id,
			nombre: chat.persona?.nombres
				? `${chat.persona.nombres} ${chat.persona.apellidos ?? ""}`.trim()
				: "Cliente anónimo",
			canal: chat.canal,
			lastMessage: chat.mensajes[0]?.contenido ?? "",
			createdAt: chat.mensajes[0]?.created_at ?? chat.created_at,
		}));
	}
	async takeChatFromQueue(chatId: string, asesorId: string): Promise<any> {
		return this.prisma.$transaction(async (tx) => {
			const res = await tx.conversaciones.updateMany({
				where: { id: chatId, estado: "ESPERANDO_ASESOR" },
				data: {
					estado: "ATENDIDO_HUMANO",
					id_usuario_asignado: asesorId,
					fecha_asignacion: new Date(),
				},
			});
			if (res.count === 0)
				throw new Error(
					"[RACE_CONDITION]: 12No se pudo tomar el chat. Es posible que ya haya sido tomado por otro asesor.",
				);
			await tx.conversacionAsignacion.create({
				data: {
					id_conversacion: chatId,
					id_usuario: asesorId,
					fecha_inicio: new Date(),
				},
			});
			await tx.eventosConversacion.create({
				data: {
					id_conversacion: chatId,
					tipo: "ASESOR_ASIGNADO",
					id_usuario: asesorId,
				},
			});
			return this.prisma.conversaciones.findUnique({
				where: { id: chatId },
				select: {
					persona: { select: { nombres: true, apellidos: true } },
				},
			});
		});
	}
	async saveMessage(
		chatId: string,
		content: string,
		senderRole: "CLIENTE" | "ASESOR" | "BOT",
	): Promise<any> {
		const chat = await this.prisma.conversaciones.findUnique({
			where: { id: chatId },
			select: {
				session_id: true,
				id_usuario_asignado: true,
				fecha_primera_respuesta_humana: true,
			},
		});
		if (!chat) throw new Error("Chat no encontrado");
		const eventType =
			senderRole === "CLIENTE" ? "MENSAJE_RECIBIDO" : "MENSAJE_ENVIADO";
		return await this.prisma.$transaction(async (tx) => {
			const newMessage = await this.prisma.mensajes.create({
				data: {
					id_conversacion: chatId,
					contenido: content,
					remitente: "HUMANO",
					...(senderRole === "ASESOR" && chat.id_usuario_asignado
						? { id_usuario: chat.id_usuario_asignado }
						: {}),
				},
			});
			await tx.eventosConversacion.create({
				data: {
					id_conversacion: chatId,
					tipo: eventType,
					...(senderRole === "ASESOR" && chat.id_usuario_asignado
						? { id_usuario: chat.id_usuario_asignado }
						: {}),
				},
			});
			if (
				senderRole === "ASESOR" &&
				!chat.fecha_primera_respuesta_humana
			) {
				await tx.conversaciones.update({
					where: { id: chatId },
					data: { fecha_primera_respuesta_humana: new Date() },
				});
			}
			return newMessage;
		});
	}
	async updateChatStatus(
		chatId: string,
		newStatus: EstadoChat,
		usuarioId?: string,
	): Promise<void> {
		await this.prisma.$transaction(async (tx) => {
			await tx.conversaciones.update({
				where: { id: chatId },
				data: {
					estado: newStatus,
					...(newStatus === "FINALIZADO"
						? { fecha_finalizacion: new Date() }
						: {}),
				},
			});
			if (newStatus === "FINALIZADO") {
				await tx.eventosConversacion.create({
					data: {
						id_conversacion: chatId,
						tipo: "FINALIZADA",
						id_usuario: usuarioId ?? null,
					},
				});
				await tx.conversacionAsignacion.updateMany({
					where: { id_conversacion: chatId, fecha_fin: null },
					data: { fecha_fin: new Date() },
				});
			}
		});
	}
	async findEventsByChatId(chatId: string): Promise<EventDTO[]> {
		const eventos = await this.prisma.eventosConversacion.findMany({
			where: { id_conversacion: chatId },
			orderBy: { created_at: "asc" },
			select: {
				id: true,
				tipo: true,
				metadata: true,
				created_at: true,
				usuario: {
					select: { id: true, nombres: true, apellidos: true },
				},
			},
		});
		return eventos.map((e) => ({
			id: e.id,
			tipo: e.tipo,
			usuario: e.usuario,
			metadata: e.metadata as Record<string, unknown> | null,
			created_at: e.created_at,
		}));
	}
	async findAssignmentsByChatId(chatId: string): Promise<AsignacionDTO[]> {
		return this.prisma.conversacionAsignacion.findMany({
			where: { id_conversacion: chatId },
			orderBy: { fecha_inicio: "asc" },
			select: {
				id: true,
				fecha_inicio: true,
				fecha_fin: true,
				motivo: true,
				usuario: {
					select: { id: true, nombres: true, apellidos: true },
				},
			},
		});
	}
	async findLastClientMessageTime(chatId: string): Promise<Date | null> {
		const msg = await this.prisma.mensajes.findFirst({
			where: {
				id_conversacion: chatId,
				remitente: "HUMANO",
				id_usuario: null,
			},
			orderBy: { created_at: "desc" },
		});
		return msg?.created_at ?? null;
	}
	async forceAssignChat(chatId: string, asesorId: string): Promise<void> {
		await this.prisma.$transaction(async tx => {
			await tx.conversaciones.update({
				where: { id: chatId },
				data: {
					estado: "ATENDIDO_HUMANO",
					id_usuario_asignado: asesorId,
					fecha_asignacion: new Date()
				}
			})
			await tx.conversacionAsignacion.updateMany({
				where: { id_conversacion: chatId, fecha_fin: null },
				data: { fecha_fin: new Date() }
			})
			await tx.conversacionAsignacion.create({
				data: {
					id_conversacion: chatId,
					id_usuario: asesorId,
					fecha_inicio: new Date(),
					motivo: "Seguimiento de cotización",
				},
			});
			await tx.eventosConversacion.create({
				data: {
					id_conversacion: chatId,
					tipo: "ASESOR_ASIGNADO",
					id_usuario: asesorId,
					metadata: {
						origen: "cotizacion"
					}
				}
			})
		});
	}
}
