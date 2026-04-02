import { BACKEND_BASE_URL } from "@/shared/constants";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useLiveChatStore } from "../store/useLiveChatStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { liveChatService } from "../service/liveChatService";
import type { ChatRequiresHumanEvt } from "../types/live";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth";
import type { ChatStatus } from "../types";
import { chatsService } from "../service/chatsService";
import type { ApiError } from "@/core/types";

export const useLiveChat = () => {
	const { user } = useAuthStore();
	const socket = useRef<Socket | null>(null);
	const {
		setInitialQueue,
		setInitialActiveChats,
		addChatToQueue,
		removeChatFromQueue,
		moveChatToActive,
        updateChatLastMessage
	} = useLiveChatStore();
    const queryClient = useQueryClient();
	const { isLoading: isLoadingQueue } = useQuery({
		queryKey: ["live-chat-queue"],
		queryFn: async () => {
			const data = await liveChatService.getQueueChats();
			setInitialQueue(data);
			return data;
		},
		refetchOnWindowFocus: false,
	});
	const { isLoading: isLoadingActive } = useQuery({
		queryKey: ["live-chat-active"],
		queryFn: async () => {
			const data = await liveChatService.getActiveChats();
			setInitialActiveChats(data);
            if (socket.current) {
                data.forEach(chat => {
                    socket.current?.emit("client:JOIN_CHAT_ROOM", { chatId: chat.id });
                })
            }
			return data;
		},
	});
    const useUpdateChatStatusMutation = (chatId: string, newState: ChatStatus) => useMutation({
        mutationFn: () => chatsService.updateStatusChat(chatId, newState),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
            queryClient.invalidateQueries({ queryKey: ["live-chat-queue"] });
            queryClient.invalidateQueries({ queryKey: ["live-chat-active"] });
            toast.success("Estado del chat actualizado");
        },
        onError: (error: ApiError) => {
            const errorMessage = error.response?.data?.message || error.message || "Error al actualizar el estado del chat";
            toast.error(errorMessage);
        } 
    })
	useEffect(() => {
		if (!socket.current) {
			const socketOrigin = new URL(BACKEND_BASE_URL).origin;
			socket.current = io(socketOrigin, {
				path: "/api/socket.io",
				transports: ["websocket", "polling"],
				withCredentials: true,
			});
			socket.current.on(
				"server:CHAT_REQUIRES_HUMAN",
				(payload: ChatRequiresHumanEvt) => {
					const nombreCliente = payload.info?.cliente?.nombres
						? `${payload.info.cliente.nombres} ${payload.info.cliente.apellidos ?? ""}`.trim()
						: "Cliente anónimo";
					const newChatInQueue = {
						id: payload.conversacionId,
						nombre: nombreCliente,
						canal: payload.info?.canal ?? "WEB",
						lastMessage:
							payload.info?.ultimo_mensaje ?? payload.message,
						createdAt: payload.timeStamp,
					};
					addChatToQueue(newChatInQueue);
					toast.info("Nuevo cliente en espera", {
						description: `El cliente ${nombreCliente} necesita asistencia.`,
						duration: 5000,
					});
					const audio = new Audio("/sounds/notification.mp3");
					audio
						.play()
						.catch((e) =>
							console.warn(
								"No se pudo reproducir el sonido de notificación:",
								e,
							),
						);
				},
			);
			socket.current.on(
				"server:CHAT_ASSIGNED",
				(payload: { chatId: string; asesorId: string }) => {
					if (payload.asesorId === user?.id) {
						moveChatToActive(payload.chatId);
						toast.success("Has tomado el chat exitosamente");
                        socket.current?.emit("client:JOIN_CHAT_ROOM", { chatId: payload.chatId });
					} else removeChatFromQueue(payload.chatId);
				},
			);
            socket.current.on("server:NEW_MESSAGE", (payload: { chatId: string, content: string, role: string }) => {
                queryClient.invalidateQueries({ queryKey: ["chat", payload.chatId] });
                if (payload.role === "cliente") {
                    updateChatLastMessage(payload.chatId, payload.content);
                    toast("Nuevo mensaje", {
                        description: payload.content,
                        duration: 5000,
                        icon: "📩",
                    });
                    const audio = new Audio("/sounds/notification.mp3");
                    audio
                        .play()
                        .catch((e) =>
                            console.warn(
                                "No se pudo reproducir el sonido de notificación:",
                                e,
                            ),
                        );
                }
            })
			socket.current.on("connect_error", (err) => {
				console.error(
					"Error de conexión al servidor de WebSocket:",
					err,
				);
			});
		}
		return () => {
			if (socket.current) {
				socket.current.disconnect();
				socket.current = null;
			}
		};
	}, [addChatToQueue, removeChatFromQueue, moveChatToActive, updateChatLastMessage, user]);
	const handleTakeChat = (chatId: string) => {
		if (!user) {
			toast.error(
				"No estás autenticado. Por favor, inicia sesión para tomar el chat.",
			);
			return;
		}
		if (socket.current)
			socket.current.emit("client:TAKE_CHAT", {
				chatId,
				asesorId: user.id,
			});
	};
	const handleSendMessage = (chatId: string, content: string) => {
		if (socket.current)
			socket.current.emit("client:SEND_MESSAGE", {
				chatId,
				content,
				senderRole: "ASESOR",
			});
	};
	return {
		isLoadingItems: isLoadingQueue || isLoadingActive,
		handleTakeChat,
		handleSendMessage,
        useUpdateChatStatusMutation,
	};
};
