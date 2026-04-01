import type { CanalContacto, EstadoChat } from "../types";
import { FiMessageCircle, FiMonitor } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export const getEstadoChatConfig = (estado: EstadoChat) => {
    const configs: Record<EstadoChat, { label: string; colorClass: string }> = {
        BOT: { label: "Bot Automático", colorClass: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
        ESPERANDO_ASESOR: { label: "En Cola", colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
        ATENDIDO_HUMANO: { label: "En Curso", colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
        FINALIZADO: { label: "Finalizado", colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    };
    return configs[estado] || { label: "Desconocido", colorClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
};

export const getCanalIcon = (canal: CanalContacto | null) => {
    switch (canal) {
        case "WHATSAPP": return FaWhatsapp;
        case "WEB": return FiMonitor;
        default: return FiMessageCircle;
    }
};

export const formatChatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
};

export const getRelativeWaitTime = (isoString: string) => {
    const min = Math.round((new Date().getTime() - new Date(isoString).getTime()) / 60000);
    if (min < 1) return "Justo ahora";
    if (min < 60) return `Hace ${min} min`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `Hace ${hr} hr${hr > 1 ? "s" : ""}`;
    const day = Math.round(hr / 24);
    return `Hace ${day} día${day > 1 ? "s" : ""}`;
}