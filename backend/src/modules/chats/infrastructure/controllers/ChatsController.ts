import { NextFunction, Request, Response } from "express";
import { ChatUseCases } from "../../application/use-cases/ChatsUseCases";
import { CanalContacto, EstadoChat } from "generated/prisma/enums";

export class ChatsController {
    constructor(private chatUseCases: ChatUseCases) {}
    getChats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                q,
                estado,
                canal,
                page = 1,
                limit = 10,
            } = req.query;
            const query = {
                q: q ? String(q) : undefined,
                estado: estado ? String(estado) as EstadoChat : undefined,
                canal: canal ? String(canal) as CanalContacto : undefined,
                page: Number(page),
                limit: Number(limit),
            };
            const chats = await this.chatUseCases.getChats(query);
            res.json({
                success: true,
                ...chats,
            });
        } catch (error) {
            next(error);
        }
    }
    getChatById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { chatId } = req.params;
            const chat = await this.chatUseCases.getChatById(String(chatId));
            res.json({
                success: true,
                data: chat,
            });
        } catch (error) {
            next(error);
        }
    }
    getChatBySessionId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sessionId } = req.params;
            const chat = await this.chatUseCases.getChatBySessionId(String(sessionId));
            res.json({
                success: true,
                data: chat,
            });
        } catch (error) {
            next(error);
        }
    }
    getLiveChatQueue = async (_: Request, res: Response, next: NextFunction) => {
        try {
            const queue = await this.chatUseCases.getLiveChatQueue();
            res.json({
                success: true,
                data: queue,
            });
        } catch (error) {
            next(error);
        }
    }
    getLiveActiveChats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id_usuario } = req.query;
            const activeChats = await this.chatUseCases.getLiveActiveChats(String(id_usuario));
            res.json({
                success: true,
                data: activeChats,
            });
        } catch (error) {
            next(error);

        }
    }
}