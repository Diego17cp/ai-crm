import { useState } from "react";
import type { Client } from "../types";

export type ClientModalType =
	| "none"
	| "create_client"
	| "edit_client"
	| "delete_client";

export const useClientModals = () => {
	const [activeModal, setActiveModal] = useState<ClientModalType>("none");
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);

	const openModal = (type: ClientModalType, client?: Client) => {
		if (client) setSelectedClient(client);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedClient(null);
		}, 300);
	};

	return {
		activeModal,
		selectedClient,
		openModal,
		closeModal,
	};
};