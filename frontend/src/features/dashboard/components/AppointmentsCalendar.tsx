import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { AppointmentEvent } from "../types";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";

interface Props {
    events: AppointmentEvent[];
    isLoading: boolean;
}

export const AppointmentsCalendar = ({ events, isLoading }: Props) => {
    const [selectedEvent, setSelectedEvent] = useState<{
        title: string;
        start: Date | null;
        end: Date | null;
        allDay: boolean;
        color?: string;
    } | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedEvent(null);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEventClick = (clickInfo: any) => {
        const event = clickInfo.event;
        setSelectedEvent({
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            color: event.backgroundColor,
        });
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return new Intl.DateTimeFormat("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        }).format(date);
    };

    const formatTime = (date: Date | null) => {
        if (!date) return "";
        return new Intl.DateTimeFormat("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
        }).format(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 w-full overflow-hidden relative"
        >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
                Agenda de Citas
            </h2>

            <div className={`transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <div className="fc-theme-modern hidden md:block">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locale={esLocale}
                        events={events}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        height="auto"
                        aspectRatio={1.5}
                        buttonText={{
                            today: "Hoy",
                            month: "Mes",
                            week: "Sem",
                            day: "Día",
                        }}
                        eventClassNames="rounded-md shadow-sm border-none px-1 text-xs cursor-pointer hover:brightness-110 transition-all font-medium"
                        dayMaxEvents={true}
                        eventClick={handleEventClick}
                    />
                </div>
                <div className="fc-theme-modern md:hidden">
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridDay"
                        locale={esLocale}
                        events={events}
                        headerToolbar={{
                            left: "prev,next",
                            center: "title",
                            right: "today",
                        }}
                        height="auto"
                        slotMinTime="08:00:00"
                        slotMaxTime="19:00:00"
                        eventClassNames="rounded-md shadow-sm border-none px-1 text-xs hover:opacity-90 transition-opacity"
                        eventClick={handleEventClick}
                    />
                </div>
            </div>            
            <AnimatePresence>
                {selectedEvent && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-100"
                            onClick={() => setSelectedEvent(null)}
                        />
                        <div className="fixed inset-0 z-105 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col"
                            >
                                <div 
                                    className="px-6 py-5 relative"
                                    style={{ backgroundColor: selectedEvent.color || "#0d9488" }}
                                >
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="absolute cursor-pointer top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
                                    >
                                        <FiX size={18} />
                                    </button>
                                    <h3 className="text-xl font-bold text-white pr-6 leading-tight">
                                        {selectedEvent.title}
                                    </h3>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                                            <FiCalendar size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Fecha</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {formatDate(selectedEvent.start)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                                            <FiClock size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Horario</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedEvent.allDay 
                                                    ? "Todo el día" 
                                                    : `${formatTime(selectedEvent.start)} ${selectedEvent.end ? `- ${formatTime(selectedEvent.end)}` : ''}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedEvent(null)}
                                        className="mt-2 cursor-pointer w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151; background-color: transparent; }
                .dark .fc-col-header-cell-cushion { color: #e5e7eb; }
                .dark .fc-daygrid-day-number { color: #d1d5db; }
                .dark .fc-button-primary { background-color: #0d9488 !important; border-color: #0d9488 !important; }
                .dark .fc-button-primary:hover { background-color: #0f766e !important; border-color: #0f766e !important; }
                .dark .fc-button-primary:disabled { background-color: #115e59 !important; border-color: #115e59 !important; }
                .dark .fc .fc-toolbar-title { color: #f3f4f6; font-size: 1.25rem; }
                .fc-header-toolbar { flex-wrap: wrap; gap: 0.5rem; }
                .fc .fc-button { padding: 0.4rem 0.8rem; border-radius: 0.5rem; text-transform: capitalize; }
            `}</style>
        </motion.div>
    );
};