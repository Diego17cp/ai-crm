import { useState, useEffect } from "react";
import type { DashboardStats, AppointmentEvent } from "../types";

const MOCK_STATS: DashboardStats = {
    leads: 1248,
    clients: 342,
    soldLots: 156,
    availableLots: 89,
};

// Generamos algunas fechas relativas para que siempre veas eventos hoy
const today = new Date();
const MOCK_EVENTS: AppointmentEvent[] = [
    {
        id: "1",
        title: "Visita Lote 15 - Manzana A",
        start: new Date(today.setHours(10, 0, 0)).toISOString(),
        end: new Date(today.setHours(11, 0, 0)).toISOString(),
        backgroundColor: "#0d9488", // teal-600
    },
    {
        id: "2",
        title: "Firma de Contrato - Cliente VIP",
        start: new Date(today.setHours(15, 30, 0)).toISOString(),
        backgroundColor: "#2563eb", // blue-600
    },
    {
        id: "3",
        title: "Tour Guiado - Familia Pérez",
        start: new Date(new Date().setDate(today.getDate() + 1)).toISOString(),
        allDay: true,
        backgroundColor: "#d97706", // amber-600
    },
];

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulamos el delay de una API
        const timer = setTimeout(() => {
            setStats(MOCK_STATS);
            setEvents(MOCK_EVENTS);
            setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    return {
        stats,
        events,
        isLoading,
    };
};