import { useState } from "react";
import type { Cita } from "../types";

export type ProjectModalType =
	| "none"
	| "create_appointment"
    // dependiendo tu criterio | "view_appointment"
    | "mark_attended"
    | "mark_canceled"
	| "edit_appointment"
	| "delete_appointment";

export const useAppointmentsModals = () => {
	const [activeModal, setActiveModal] = useState<ProjectModalType>("none");
	const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

	const openModal = (type: ProjectModalType, cita?: Cita) => {
		if (cita) setSelectedCita(cita);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedCita(null);
		}, 300);
	};

	return {
		activeModal,
		selectedCita,
		openModal,
		closeModal,
	};
};
