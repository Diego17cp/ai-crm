import { Server, Socket } from "socket.io";
import { QuoteUseCases } from "../../application/use-cases/QuoteUseCases";

export class SocketQuotesController {
	constructor(
		private io: Server,
		private quoteUseCases: QuoteUseCases,
	) {}

	registerListeners(socket: Socket) {
		socket.on("client:JOIN_QUOTE_ROOM", (payload: { quoteId: string }) => {
			if (payload.quoteId) socket.join(payload.quoteId);
		});
		socket.on(
			"client:TAKE_REVIEW",
			async (payload: { quoteId: number; asesorId: string }) => {
				try {
					await this.quoteUseCases.takeReview(payload.quoteId, payload.asesorId)
					this.io.emit("server:QUOTE_ASSIGNED", {
						quoteId: payload.quoteId,
						asesorId: payload.asesorId,
					});
					socket.join(String(payload.quoteId));
				} catch (error: any) {
					socket.emit("server:ERROR", {
						message: error.message || "Error al tomar la revision",
						code: "QUOTE_TAKEN",
					});
				}
			},
		);
    socket.on("client:REJECT_REVIEW", async (payload: { quoteId: number, asesorId: string }) => {
      try {
        await this.quoteUseCases.rejectReview(payload.quoteId, payload.asesorId)
        this.io.emit("server:QUOTE_REJECTED", {
          quoteId: payload.quoteId,
          asesorId: payload.asesorId
        })
        socket.leave(String(payload.quoteId))
      } catch (error: any) {
        socket.emit("server:ERROR", {
          message: error.message || "Error al rechazar la revision",
          code: "QUOTE_REJECTED"
        })
      }
    })
    socket.on("client:APPROVE_REVIEW", async (payload: { quoteId: number, asesorId: string }) => {
      try {
        await this.quoteUseCases.approveReview(payload.quoteId, payload.asesorId)
        this.io.emit("server:QUOTE_APPROVED", {
          quoteId: payload.quoteId,
          asesorId: payload.asesorId
        })
        socket.leave(String(payload.quoteId))
      } catch (error: any) {
        socket.emit("server:ERROR", {
          message: error.message || "Error al aprobar la revision",
          code: "QUOTE_APPROVED"
        })
      }
    })
	}
}
