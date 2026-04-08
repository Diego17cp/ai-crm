import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect, useMemo } from "react";
import { chatbotService } from "../service/chatbot.service";
import { BACKEND_BASE_URL, STORAGE_KEY } from "@/shared/constants";
import { chatsService } from "../service/chatsService";
import { NOMBRE_EMPRESA } from "@/shared/constants";
import type { ApiError } from "@/core/types";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

export type UserRole = "user" | "bot" | "asesor";

export interface Message {
	id: string;
	role: UserRole;
	content: string;
}

export const useChatbot = () => {
	const queryClient = useQueryClient();
	const sessionId = localStorage.getItem(STORAGE_KEY) || "";
	const socket = useRef<Socket | null>(null);
	const { data: chatHistory, ...chatQuery } = useQuery({
		queryKey: ["chatSession", sessionId],
		queryFn: () => chatsService.getChatsBySessionId(sessionId),
		enabled: !!sessionId,
		// staleTime: Infinity,
	});
	const [localMessages, setLocalMessages] = useState<Message[]>([]);
	const isLiveMode = useMemo(() =>  chatHistory?.data?.estado === "ATENDIDO_HUMANO", [chatHistory]);
	const activeChatIdRef = useRef<string | null>(null);
	useEffect(() => {
		activeChatIdRef.current = chatHistory?.data.id || null;
		console.log("Chat history updated, active chat ID set to:", activeChatIdRef.current);
	}, [chatHistory?.data?.id]);
	useEffect(() => {
		if (chatHistory?.data.mensajes) setLocalMessages([]);
	}, [chatHistory?.data.mensajes]);
	useEffect(() => {
		const socketOrigin = new URL(BACKEND_BASE_URL).origin;
		if (!socket.current) {
			socket.current = io(socketOrigin, {
				path: "/api/socket.io",
				transports: ["websocket", "polling"],
			});
		}
		const currentSocket = socket.current;
		const handleConnect = () => {
			if (activeChatIdRef.current) {
				currentSocket.emit("client:JOIN_CHAT_ROOM", { chatId: activeChatIdRef.current });
				queryClient.invalidateQueries({ queryKey: ["chatSession", sessionId] });
			}
		}
		const handleChatAssigned = (payload: { chatId: string, asesorId: string }) => {
			if (payload.chatId === activeChatIdRef.current) {
				queryClient.invalidateQueries({ queryKey: ["chatSession", sessionId] });
				toast.info("¡Un asesor se acaba de unir al chat para asistirte!");
				setLocalMessages(prev => [...prev, {
					id: `sys-${Date.now()}`,
					role: "bot",
					content: "¡Un asesor se acaba de unir al chat para asistirte!"
				}]);
			}
		};
		const handleNewMessage = (payload: { chatId: string, content: string, role: string }) => {
			if (payload.chatId === activeChatIdRef.current && payload.role !== "cliente") {
				setLocalMessages(prev => [...prev, {
					id: `asesor-${Date.now()}`,
					role: "asesor",
					content: payload.content,
				}]);
			}
		}
		socket.current.on("connect", handleConnect);
		socket.current.on("server:CHAT_ASSIGNED", handleChatAssigned);
		socket.current.on("server:NEW_MESSAGE", handleNewMessage);
		return () => {
			currentSocket.off("connect", handleConnect);
			currentSocket.off("server:CHAT_ASSIGNED", handleChatAssigned);
			currentSocket.off("server:NEW_MESSAGE", handleNewMessage);
			// currentSocket.disconnect();
		}
	}, [sessionId, queryClient]);
	useEffect(() => {
		if (socket.current && socket.current.connected && chatHistory?.data.id) {
			socket.current.emit("client:JOIN_CHAT_ROOM", { chatId: chatHistory.data.id });
		}
	}, [chatHistory?.data.id]);
	const welcomeMessage: Message = {
		id: "welcome",
		role: "bot",
		content: `¡Hola! Soy el asistente virtual de ${NOMBRE_EMPRESA}. ¿En qué te puedo ayudar hoy?`,
	};
	const messages = useMemo(() => {
		const history: Message[] = chatHistory?.data.mensajes?.map(msg => ({
			id: msg.id.toString(),
			role: msg.remitente === "BOT" 
                ? "bot" 
                : (msg.usuario ? "asesor" : "user"),
			content: msg.contenido,
		})) || [];
		return [welcomeMessage, ...history, ...localMessages];
	}, [chatHistory, localMessages]);
	const [inputValue, setInputValue] = useState("");
	const messageMutation = useMutation({
		mutationFn: (msg: string) => chatbotService.sendMessage(msg),
		onSuccess: (data) => {
			const newBotMsg: Message = {
				id: `bot-${Date.now().toString()}`,
				role: "bot",
				content: data,
			};
			setLocalMessages((prev) => [...prev, newBotMsg]);
			queryClient.invalidateQueries({ queryKey: ["chatSession", sessionId] });
		}
	});
	const isLoading = messageMutation.isPending;
	const isError = messageMutation.isError;
	const isFatalError = chatQuery.isError && (chatQuery.error as ApiError)?.response?.status !== 404; // Si es 404, es porque no hay chat previo, no es un error fatal
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

	useEffect(() => scrollToBottom(), [messages, isLoading]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const messageToSend = inputValue.trim();
		if (!messageToSend) return;
		const newUserMsg: Message = {
			id: `user-${Date.now().toString()}`,
			role: "user",
			content: inputValue,
		};
		setLocalMessages((prev) => [...prev, newUserMsg]);
		setInputValue("");
		if (isLiveMode) {
			socket.current?.emit("client:SEND_MESSAGE", {
				chatId: chatHistory?.data.id,
				content: messageToSend,
				senderRole: "CLIENTE"
			})
		} else messageMutation.mutate(messageToSend);
	};

	return {
		messages,
		inputValue,
		isLoading,
		isError,
		messagesEndRef,
		handleInputChange,
		handleSubmit,
		isInitialLoading: chatQuery.isLoading,
		isFatalError,
		chatQuery,
		isLiveMode,
		chatHistory
	};
};
