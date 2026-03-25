import type { EstadoContrato, EstadoCuota, EstadoVenta, TipoPago } from "../types";

export const formatCurrency = (amount: string | number | null) => {
	if (!amount) return "S/. 0.00";
	return new Intl.NumberFormat("es-PE", {
		style: "currency",
		currency: "PEN",
	}).format(Number(amount));
};

export const formatDate = (dateString: string | null) => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleDateString("es-PE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
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

export const getEstadoCuotaColor = (estado: EstadoCuota) => {
	return estado === "PAGADO"
		? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
		: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
};

export const getEstadoContratoColor = (estado: EstadoContrato) => {
	switch (estado) {
		case "FIRMADO": return "bg-blue-100 text-blue-700";
		case "ADENDA": return "bg-purple-100 text-purple-700";
		case "ESCRITURA PUBLICA": return "bg-indigo-100 text-indigo-700";
		case "POR RESOLVER": return "bg-red-100 text-red-700";
		case "CESION CONTRACTUAL": return "bg-cyan-100 text-cyan-700";
		default: return "bg-gray-100 text-gray-700";
	}
};