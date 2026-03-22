import { useState } from "react";
import type { Lote } from "../types";

export type ProjectModalType =
	| "none"
	| "create_lot"
	| "edit_lot"
	| "delete_lot";

export const useLotModals = () => {
	const [activeModal, setActiveModal] = useState<ProjectModalType>("none");
	const [selectedLot, setSelectedLot] = useState<Lote | null>(null);

	const openModal = (type: ProjectModalType, lot?: Lote) => {
		if (lot) setSelectedLot(lot);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedLot(null);
		}, 300);
	};

	return {
		activeModal,
		selectedLot,
		openModal,
		closeModal,
	};
};
