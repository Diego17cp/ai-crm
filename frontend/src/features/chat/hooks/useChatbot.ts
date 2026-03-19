import { useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { chatbotService } from "../service/chatbot.service";

export type UserRole = "user" | "bot";

export interface Message {
	id: string;
	role: UserRole;
	content: string;
}

export const useChatbot = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "bot",
			content: "¡Hola! Soy tu asistente virtual para proyectos inmobiliarios. ¿En qué te puedo ayudar hoy?",
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const messageMutation = useMutation({
		mutationFn: (msg: string) => chatbotService.sendMessage(msg),
		onSuccess: (data) => {
			const newBotMsg: Message = {
				id: Date.now().toString(),
				role: "bot",
				content: data,
			};
			setMessages((prev) => [...prev, newBotMsg]);
		}
	});
	const isLoading = messageMutation.isPending;
	const isError = messageMutation.isError;
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

	useEffect(() => scrollToBottom(), [messages, isLoading]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const messageToSend = inputValue.trim();
		if (!messageToSend) return;
		const newUserMsg: Message = {
			id: Date.now().toString(),
			role: "user",
			content: inputValue,
		};
		setMessages((prev) => [...prev, newUserMsg]);
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
	};
};
