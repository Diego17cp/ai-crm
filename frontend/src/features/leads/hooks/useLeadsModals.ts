import { useState } from "react";
import type { Lead } from "../types";

export type ProjectModalType =
	| "none"
	| "create_lead"
	| "edit_lead"
	| "delete_lead";

export const useLeadModals = () => {
	const [activeModal, setActiveModal] = useState<ProjectModalType>("none");
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

	const openModal = (type: ProjectModalType, lead?: Lead) => {
		if (lead) setSelectedLead(lead);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedLead(null);
		}, 300);
	};

	return {
		activeModal,
		selectedLead,
		openModal,
		closeModal,
	};
};
