import { useState } from "react";
import type { Lead } from "@/features/leads/types";

export type ProjectModalType =
	| "none"
	| "create_client"
	| "edit_client"
	| "delete_client";

export const useClientModals = () => {
	const [activeModal, setActiveModal] = useState<ProjectModalType>("none");
	const [selectedClient, setSelectedClient] = useState<Lead | null>(null);

	const openModal = (type: ProjectModalType, client?: Lead) => {
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