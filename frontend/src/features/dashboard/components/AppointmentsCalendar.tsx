import { motion } from "motion/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { AppointmentEvent } from "../types";

interface Props {
    events: AppointmentEvent[];
    isLoading: boolean;
}

export const AppointmentsCalendar = ({ events, isLoading }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 w-full overflow-hidden"
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
                        eventClassNames="rounded-md shadow-sm border-none px-1 text-xs cursor-pointer"
                        dayMaxEvents={true}
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
                        eventClassNames="rounded-md shadow-sm border-none px-1 text-xs"
                    />
                </div>
            </div>            
            <style>{`
                .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151; background-color: transparent; }
                .dark .fc-col-header-cell-cushion { color: #e5e7eb; }
                .dark .
                .dark .fc-daygrid-day-number { color: #d1d5db; }
                .dark .fc-button-primary { background-color: #0f766e !important; border-color: #0f766e !important; }
                .dark .fc-button-primary:hover { background-color: #115e59 !important; border-color: #115e59 !important; }
                .dark .fc-button-primary:disabled { background-color: #134e4a !important; border-color: #134e4a !important; }
                .dark .fc .fc-toolbar-title { color: #f3f4f6; font-size: 1.25rem; }
                .fc-header-toolbar { flex-wrap: wrap; gap: 0.5rem; }
                .fc .fc-button { padding: 0.4rem 0.8rem; border-radius: 0.5rem; text-transform: capitalize; }
            `}</style>
        </motion.div>
    );
};