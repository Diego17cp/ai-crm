import type { EstadoLead, Lead } from "../types";

export const getInitials = (
	nombres: string | null,
	apellidos: string | null,
) => {
	const firstName = nombres?.trim().charAt(0);
	const lastName = apellidos?.trim().charAt(0);

	return `${firstName ?? ""}${lastName ?? ""}`.toUpperCase() || null;
};

export const getFullName = (
	nombres: string | null,
	apellidos: string | null,
) => {
	return [nombres, apellidos].filter(Boolean).join(" ") || "Sin nombre";
};

export const getNationality = (lead: Lead) => {
	if (lead.persona.es_peruano === true) return "Peruana";
	if (lead.persona.nacionalidad) return lead.persona.nacionalidad;

	return "No especificada";
};

export const getStateColor = (state: EstadoLead) => {
	switch (state) {
		case "NUEVO":
			return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
		case "CONTACTADO":
			return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
		case "CALIFICADO":
			return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
		case "INTERESADO":
			return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
		case "CITA_AGENDADA":
			return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400";
		case "NEGOCIACION":
			return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
		case "GANADO":
			return "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400";
		case "PERDIDO":
			return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
	}
};

export const getDotStateColor = (state: EstadoLead) => {
	switch (state) {
		case "NUEVO":
			return "bg-blue-500";
		case "CONTACTADO":
			return "bg-amber-500";
		case "CALIFICADO":
			return "bg-orange-500";
		case "INTERESADO":
			return "bg-green-500";
		case "CITA_AGENDADA":
			return "bg-purple-500";
		case "NEGOCIACION":
			return "bg-yellow-500";
		case "GANADO":
			return "bg-teal-500";
		case "PERDIDO":
			return "bg-red-500";
		default:
			return "bg-gray-500";
	}
}