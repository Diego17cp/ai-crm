import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect, useMemo } from "react";
import { chatbotService } from "../service/chatbot.service";
import { STORAGE_KEY } from "@/shared/constants";
import { chatsService } from "../service/chatsService";
import { NOMBRE_EMPRESA } from "@/shared/constants";
import type { ApiError } from "@/core/types";

export type UserRole = "user" | "bot";

export interface Message {
	id: string;
	role: UserRole;
	content: string;
}

export const useChatbot = () => {
	const sessionId = localStorage.getItem(STORAGE_KEY) || "";
	const { data: chatHistory, ...chatQuery } = useQuery({
		queryKey: ["chatSession", sessionId],
		queryFn: () => chatsService.getChatsBySessionId(sessionId),
		enabled: !!sessionId,
		staleTime: Infinity,
	});
	const [localMessages, setLocalMessages] = useState<Message[]>([]);
	const welcomeMessage: Message = {
		id: "welcome",
		role: "bot",
		content: `¡Hola! Soy el asistente virtual de ${NOMBRE_EMPRESA}. ¿En qué te puedo ayudar hoy?`,
	};
	const messages = useMemo(() => {
		const history: Message[] = chatHistory?.data.mensajes?.map(msg => ({
			id: msg.id.toString(),
			role: msg.remitente === "BOT" ? "bot" : "user",
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
		messageMutation.mutate(messageToSend);
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
		chatQuery
	};
};
