import { useState } from "react";
import type { Chat } from "../types";

export type ChatModalType =
	| "none"
	| "view_details";

export const useChatModals = () => {
	const [activeModal, setActiveModal] = useState<ChatModalType>("none");
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

	const openModal = (type: ChatModalType, chat?: Chat) => {
		if (chat) setSelectedChat(chat);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedChat(null);
		}, 300);
	};

	return {
		activeModal,
		selectedChat,
		openModal,
		closeModal,
	};
};
