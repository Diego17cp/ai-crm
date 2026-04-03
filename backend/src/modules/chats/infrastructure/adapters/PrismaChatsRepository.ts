import { EstadoChat, PrismaClient } from "generated/prisma/client";
import { IChatsRepository } from "../../application/ports/IChatsRepository";
import { GetChatsQueryDTO, PaginatedChatResults, ChatDTO, LiveChatQueueItemDTO } from "../../domain/dtos";
import { ConversacionesWhereInput } from "generated/prisma/models";

export class PrismaChatsRepository implements IChatsRepository {
    constructor(private readonly prisma: PrismaClient) {}
    async findChats(query: GetChatsQueryDTO): Promise<PaginatedChatResults<Omit<ChatDTO, "mensajes">>> {
        const { q, estado, canal, page, limit } = query;
        const skip = (page - 1) * limit;
        const whereCondition: ConversacionesWhereInput = {};
        if (q) {
            whereCondition.OR = [
                { cliente: { nombres: { contains: q, mode: "insensitive" } } },
                { cliente: { apellidos: { contains: q, mode: "insensitive" } } },
                { asesor: { nombres: { contains: q, mode: "insensitive" } } },
                { asesor: { apellidos: { contains: q, mode: "insensitive" } } },
                { asesor: { rol: { nombre: { contains: q, mode: "insensitive" } } } },
            ];
        }

        if (estado) whereCondition.estado = estado;
        if (canal) whereCondition.canal = canal;
        const [total, chats] = await Promise.all([
            this.prisma.conversaciones.count({ where: whereCondition }),
            this.prisma.conversaciones.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombres: true,
                            apellidos: true,
                        }
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
                                }
                            }
                        }
                    }
                }
            })
        ]);
        const totalPages = Math.ceil(total / limit);
        const data = chats.map(chat => ({
            id: chat.id,
            cliente: chat.cliente,
            asesor: chat.asesor,
            created_at: chat.created_at,
            estado: chat.estado,
            canal: chat.canal,
            session_id: chat.session_id,
        }));
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        }
    }
    async findChatById(chatId: string): Promise<ChatDTO | null> {
        const chat = await this.prisma.conversaciones.findUnique({
            where: { id: chatId },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                    }
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
                            }
                        }
                    }
                },
                mensajes: {
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
                                    }
                                }
                            }
                        },
                        remitente: true,
                        created_at: true,
                        contenido: true,
                    }
                }
            }
        })
        return chat ? chat as ChatDTO : null;
    }
    async findChatBySessionId(sessionId: string): Promise<ChatDTO | null> {
        const chat = await this.prisma.conversaciones.findFirst({
            where: { session_id: sessionId },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                    }
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
                            }
                        }
                    }
                },
                mensajes: {
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
                                    }
                                }
                            }
                        },
                        remitente: true,
                        created_at: true,
                        contenido: true,
                    }
                }
            }
        })
        return chat ? chat as ChatDTO : null;
    }
    async findLiveChatQueue(): Promise<LiveChatQueueItemDTO[]> {
        const chats = await this.prisma.conversaciones.findMany({
            where: { estado: "ESPERANDO_ASESOR" },
            orderBy: { created_at: "asc" },
            include: {
                cliente: {
                    select: {
                        nombres: true,
                        apellidos: true,
                    }
                },
                mensajes: {
                    take: 1,
                    orderBy: { created_at: "desc" },
                    select: {
                        contenido: true,
                        created_at: true,
                    }
                }
            }
        });
        return chats.map(chat => ({
            id: chat.id,
            nombre: chat.cliente?.nombres 
                ? `${chat.cliente.nombres} ${chat.cliente.apellidos ?? ""}`.trim()
                : "Cliente anónimo",
            canal: chat.canal,
            lastMessage: chat.mensajes[0]?.contenido ?? "",
            createdAt: chat.mensajes[0]?.created_at ?? chat.created_at,
        }))
    }
    async findLiveActiveChats(idUsuario: string): Promise<LiveChatQueueItemDTO[]> {
        const chats = await this.prisma.conversaciones.findMany({
            where: { id_usuario_asignado: idUsuario, estado: "ATENDIDO_HUMANO" },
            include: {
                cliente: {
                    select: {
                        nombres: true,
                        apellidos: true,
                    }
                },
                mensajes: {
                    take: 1,
                    orderBy: { created_at: "desc" },
                    select: {
                        contenido: true,
                        created_at: true,
                    }
                }
            }
        });
        return chats.map(chat => ({
            id: chat.id,
            nombre: chat.cliente?.nombres 
                ? `${chat.cliente.nombres} ${chat.cliente.apellidos ?? ""}`.trim()
                : "Cliente anónimo",
            canal: chat.canal,
            lastMessage: chat.mensajes[0]?.contenido ?? "",
            createdAt: chat.mensajes[0]?.created_at ?? chat.created_at,
        }))
    }
    async takeChatFromQueue(chatId: string, asesorId: string): Promise<any> {
        const res = await this.prisma.conversaciones.updateMany({
            where: { id: chatId, estado: "ESPERANDO_ASESOR" },
            data: { estado: "ATENDIDO_HUMANO", id_usuario_asignado: asesorId, fecha_asignacion: new Date() },
        });
        if (res.count === 0) throw new Error("[RACE_CONDITION]: 12No se pudo tomar el chat. Es posible que ya haya sido tomado por otro asesor.");
        return this.prisma.conversaciones.findUnique({ where: { id: chatId }, select: { cliente: { select: { nombres: true, apellidos: true } } } });
    }
    async saveMessage(chatId: string, content: string, senderRole: "CLIENTE" | "ASESOR" | "BOT"): Promise<any> {
        const chat = await this.prisma.conversaciones.findUnique({
            where: { id: chatId },
            select: {
                session_id: true,
                id_usuario_asignado: true,
            }
        });
        if (!chat) throw new Error("Chat no encontrado");
        const newMessage = await this.prisma.mensajes.create({
            data: {
                id_conversacion: chatId,
                contenido: content,
                remitente: "HUMANO",
                ...(senderRole === "ASESOR" && chat.id_usuario_asignado ? { id_usuario: chat.id_usuario_asignado } : {}),
            }
        });
        return newMessage;
    }
    async updateChatStatus(chatId: string, newStatus: EstadoChat): Promise<void> {
        await this.prisma.conversaciones.update({
            where: { id: chatId },
            data: { estado: newStatus },
        });
    }
}