import { BACKEND_BASE_URL } from "@/shared/constants";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQuoteReviewStore } from "../store/useQuoteReviewStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quotesService } from "../service/quotesService";
import type { QuoteReviewRequiredEvt } from "../types/live";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth";

export const useQuoteReview = () => {
	const { user } = useAuthStore();
	const socket = useRef<Socket | null>(null);
	const {
		setInitialQueue,
		setInitialMyReviews,
		addQuoteToQueue,
		removeQuoteFromQueue,
		moveQuoteToMine,
		resolveQuote,
	} = useQuoteReviewStore();
	const queryClient = useQueryClient();

	const { isLoading: isLoadingQueue } = useQuery({
		queryKey: ["quote-review-queue"],
		queryFn: async () => {
			const data = await quotesService.getPendingQueue();
			setInitialQueue(data);
			return data;
		},
		refetchOnWindowFocus: false,
	});

	const { isLoading: isLoadingMine } = useQuery({
		queryKey: ["quote-review-mine"],
		queryFn: async () => {
			const data = await quotesService.getMyReviews(user);
			setInitialMyReviews(data);
			return data;
		},
		enabled: !!user?.id,
	});

	const useQuoteByIdQuery = (quoteId: number | null) =>
		useQuery({
			queryKey: ["quote", quoteId],
			queryFn: () => quotesService.getQuoteById(quoteId as number),
			enabled: !!quoteId,
		});

	useEffect(() => {
		if (!socket.current) {
			const socketOrigin = new URL(BACKEND_BASE_URL).origin;
			socket.current = io(socketOrigin, {
				path: "/api/socket.io",
				transports: ["websocket", "polling"],
				withCredentials: true,
			});
		}
		const currentSocket = socket.current;

		const handleQuoteRequiresReview = (payload: QuoteReviewRequiredEvt) => {
			const nombreCliente = payload.info.cliente.nombres
				? `${payload.info.cliente.nombres} ${payload.info.cliente.apellidos ?? ""}`.trim()
				: "Cliente anónimo";
			addQuoteToQueue({
				id: payload.info.id_cotizacion,
				codigo: payload.info.codigo,
				cliente: nombreCliente,
				proyecto: payload.info.proyecto,
				lote: payload.info.lote,
				precio_final: payload.info.precio_final,
				motivo_revision: payload.info.motivo_revision,
				createdAt: payload.timeStamp,
			});
			toast.info("Nueva cotización requiere revisión", {
				description: `${nombreCliente} · ${payload.info.codigo}`,
				duration: 5000,
			});
		};

		const handleQuoteAssigned = (payload: {
			quoteId: number;
			asesorId: string;
		}) => {
			if (payload.asesorId === user?.id) {
				moveQuoteToMine(payload.quoteId);
				toast.success("Tomaste esta revisión");
			} else {
				removeQuoteFromQueue(payload.quoteId);
			}
			queryClient.invalidateQueries({
				queryKey: ["quote", payload.quoteId],
			});
		};

		const handleQuoteApproved = (payload: { quoteId: number }) => {
			resolveQuote(payload.quoteId);
			queryClient.invalidateQueries({
				queryKey: ["quote", payload.quoteId],
			});
			toast.success("Cotización aprobada y enviada al cliente");
		};

		const handleQuoteRejected = (payload: { quoteId: number }) => {
			resolveQuote(payload.quoteId);
			queryClient.invalidateQueries({
				queryKey: ["quote", payload.quoteId],
			});
			toast.info("Cotización rechazada");
		};

		currentSocket.on(
			"server:QUOTE_REQUIRES_REVIEW",
			handleQuoteRequiresReview,
		);
		currentSocket.on("server:QUOTE_ASSIGNED", handleQuoteAssigned);
		currentSocket.on("server:QUOTE_APPROVED", handleQuoteApproved);
		currentSocket.on("server:QUOTE_REJECTED", handleQuoteRejected);

		return () => {
			currentSocket.off(
				"server:QUOTE_REQUIRES_REVIEW",
				handleQuoteRequiresReview,
			);
			currentSocket.off("server:QUOTE_ASSIGNED", handleQuoteAssigned);
			currentSocket.off("server:QUOTE_APPROVED", handleQuoteApproved);
			currentSocket.off("server:QUOTE_REJECTED", handleQuoteRejected);
		};
	}, [
		user,
		queryClient,
		addQuoteToQueue,
		removeQuoteFromQueue,
		moveQuoteToMine,
		resolveQuote,
	]);

	const handleTakeReview = (quoteId: number) => {
		if (!user) {
			toast.error("No estás autenticado.");
			return;
		}
		socket.current?.emit("client:TAKE_REVIEW", {
			quoteId,
			asesorId: user.id,
		});
	};

	const handleApprove = (quoteId: number) => {
		if (!user) return;
		socket.current?.emit("client:APPROVE_REVIEW", {
			quoteId,
			asesorId: user.id,
		});
	};

	const handleReject = (quoteId: number, motivo: string) => {
		if (!user) return;
		socket.current?.emit("client:REJECT_REVIEW", {
			quoteId,
			asesorId: user.id,
			motivo,
		});
	};

	const handleForceTakeChat = (conversacionId: string) => {
		if (!user) {
			toast.error("No estás autenticado.");
			return;
		}
		socket.current?.emit("client:FORCE_TAKE_CHAT", {
			chatId: conversacionId,
			asesorId: user.id,
		});
	};

	return {
		isLoadingItems: isLoadingQueue || isLoadingMine,
		useQuoteByIdQuery,
		handleTakeReview,
		handleApprove,
		handleReject,
		handleForceTakeChat,
	};
};
