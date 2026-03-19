import { Request, Response, NextFunction } from "express";
import { ProcessChatMessageUseCase } from "../../application/use-cases/ProcessChatMessageUseCase";
import { ResolveChatSessionUseCase } from "../../application/use-cases/ResolveChatSessionUseCase";

export class ChatbotController {
    constructor(
        private readonly processChatMessageUseCase: ProcessChatMessageUseCase,
        private readonly resolveChatSessionUseCase: ResolveChatSessionUseCase
    ) {}

    handleMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { identifier, canal, mensaje } = req.body;

            if (!identifier || !canal || !mensaje) {
                return res.status(400).json({
                    success: false,
                    message: "Los campos 'identifier', 'canal' y 'mensaje' son obligatorios",
                });
            }
            const conversacionId = await this.resolveChatSessionUseCase.execute(identifier, canal as 'WEB' | 'WHATSAPP');
            const respuestaBot = await this.processChatMessageUseCase.execute(
                conversacionId,
                mensaje,
            );
            return res.status(200).json({
                success: true,
                data: {
                    respuesta: respuestaBot,
                },
            });
        } catch (error) {
            return next(error);
        }
    };
}
