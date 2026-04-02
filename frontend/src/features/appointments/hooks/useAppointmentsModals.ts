import { useState } from "react";
import type { Cita } from "../types";

export type AppointmentModalType =
	| "none"
	| "create_appointment"
    | "mark_attended"
    | "mark_canceled"
	| "edit_appointment"
	| "delete_appointment";

export const useAppointmentsModals = () => {
	const [activeModal, setActiveModal] = useState<AppointmentModalType>("none");
	const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

	const openModal = (type: AppointmentModalType, cita?: Cita) => {
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
