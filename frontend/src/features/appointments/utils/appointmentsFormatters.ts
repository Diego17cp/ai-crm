import type { EstadoCita } from "../types";

export const getEstadoCitaColor = (estado: EstadoCita) => {
    switch (estado) {
        case "PROGRAMADA":
            return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
        case "ATENDIDA":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
        case "CANCELADA":
            return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(date.getTime() + date.getTimezoneOffset() * 60000));
};

export const formatTime = (timeString?: string | null) => {
    if (!timeString) return "Sin hora";
    return timeString.slice(0, 5); 
};