import { useState } from "react";
import type { Venta } from "../types";

export type VentaModalType =
	| "none"
	| "create_sale"
	| "edit_sale"
	| "delete_sale";

export const useVentaModals = () => {
	const [activeModal, setActiveModal] = useState<VentaModalType>("none");
	const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

	const openModal = (type: VentaModalType, venta?: Venta) => {
		if (venta) setSelectedVenta(venta);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedVenta(null);
		}, 300);
	};

	return {
		activeModal,
		selectedVenta,
		openModal,
		closeModal,
	};
};
