import type { EstadoVenta, TipoPago } from "../types";

export const formatCurrency = (amount: string | number | null) => {
	if (!amount) return "S/. 0.00";
	return new Intl.NumberFormat("es-PE", {
		style: "currency",
		currency: "PEN",
	}).format(Number(amount));
};

export const getEstadoVentaColor = (estado: EstadoVenta) => {
	switch (estado) {
		case "FINALIZADA":
			return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
		case "PENDIENTE":
			return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
		case "ANULADO":
			return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
		default:
			return "bg-gray-100 text-gray-700 border-gray-200";
	}
};

export const getTipoPagoColor = (tipo: TipoPago) => {
	return tipo === "CREDITO"
		? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50"
		: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
};