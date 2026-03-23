import { motion, AnimatePresence } from "motion/react";
import { FiPlus, FiRefreshCw, FiCalendar, FiX } from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useAppointments } from "../hooks/useAppointments";
import { useAppointmentsModals } from "../hooks/useAppointmentsModals";
import { AppointmentCard } from "../components/AppointmentCard";
import { AppointmentListSkeleton } from "../components/AppointmentListsSkeleton";
import { EmptyState, ErrorState, Pagination } from "@/shared/components";
import type { ApiError } from "@/core/types";
import { EditAppointmentModal } from "../components/EditAppointmentModal";
import { UpdateAppointmentStatusModal } from "../components/UpdateAppointmentStatusModal";
import { CreateAppointmentModal } from "../components/CreateAppointmentModal";
import { DeleteAppointmentModal } from "../components/DeleteAppointmentModal";

const selectClasses = {
    input: "bg-gray-50! dark:bg-gray-800/50! border-transparent! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! rounded-xl! disabled:opacity-50! text-sm! py-2.5!",
    option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40! text-sm!",
    dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
    clearButton: "dark:text-gray-400! dark:hover:text-gray-200!"
};

const estadoOpciones = [
    { value: "PROGRAMADA", label: "Programadas" },
    { value: "ATENDIDA", label: "Atendidas" },
    { value: "CANCELADA", label: "Canceladas" }
];

export const AllAppointments = () => {
    const {
        appointments,
        meta,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
        page,
        goToPage,
        filters,
        updateFilter,
        clearAllFilters,
        hasActiveFilters,
    } = useAppointments();

    const { openModal, selectedCita, activeModal, closeModal } = useAppointmentsModals();

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiCalendar className="text-teal-600 dark:text-teal-500" /> Agenda y Citas
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona y programa las visitas y reuniones con tus clientes.
                    </p>
                </motion.div>
                <div className="flex items-center gap-3">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={() => openModal("create_appointment")}
                        className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
                    >
                        <FiPlus size={18} />
                        <span className="hidden sm:inline">Nueva Cita</span>
                        <span className="sm:hidden">Nueva</span>
                    </motion.button>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Recargar datos"
                        className="p-3 cursor-pointer shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50"
                    >
                        <FiRefreshCw className={isFetching ? "animate-spin" : ""} size={18} />
                    </button>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4"
            >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="flex flex-col w-1/2 md:w-auto z-10">
                            <label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={filters.fecha_inicio || ""}
                                onChange={(e) => updateFilter("fecha_inicio", e.target.value)}
                                className="w-full md:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all scheme-light dark:scheme-dark"
                            />
                        </div>
                        <div className="flex flex-col w-1/2 md:w-auto z-10">
                            <label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={filters.fecha_fin || ""}
                                onChange={(e) => updateFilter("fecha_fin", e.target.value)}
                                className="w-full md:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all scheme-light dark:scheme-dark"
                            />
                        </div>
                    </div>
                    <div className="flex w-full md:w-1/3 gap-3">
                        <div className="w-full z-40">
                            <label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">Estado</label>
                            <SearchableSelect
                                options={estadoOpciones}
                                value={filters.estado_cita || ""}
                                onChange={(val) => updateFilter("estado_cita", val)}
                                placeholder="Todos"
                                classes={selectClasses}
                            />
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-start border-t border-gray-100 dark:border-gray-800/60 pt-3">
                            <button
                                onClick={clearAllFilters}
                                className="text-xs flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                            >
                                <FiX size={14} /> Limpiar filtros
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <div className="w-full flex-1">
                {isLoading ? (
                    <AppointmentListSkeleton />
                ) : isError ? (
                    <ErrorState
                        error={error as ApiError}
                        onRetry={refetch}
                        title="Error al cargar las citas"
                    />
                ) : appointments.length === 0 ? (
                    <EmptyState
                        title={hasActiveFilters ? "No hay citas que coincidan" : "No hay citas programadas"}
                        description={
                            hasActiveFilters
                                ? "Intenta modificar el rango de fechas o el filtro de estado."
                                : "Aún no se ha registrado ninguna cita con clientes en el sistema."
                        }
                        icon={<FiCalendar className="w-10 h-10 text-gray-400" />}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {appointments.map(cita => (
                                <AppointmentCard
                                    key={cita.id} 
                                    cita={cita}
                                    onEdit={() => openModal("edit_appointment", cita)}
                                    onMarkAttended={() => openModal("mark_attended", cita)}
                                    onMarkCanceled={() => openModal("mark_canceled", cita)}
                                    onDelete={() => openModal("delete_appointment", cita)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            {!isLoading && appointments.length > 0 && meta && (
                <div className="mt-auto">
                    <Pagination
                        currentPage={page}
                        totalPages={meta.totalPages}
                        onPageChange={goToPage}
                        isLoading={isFetching}
                        perPage={meta.limit}
                        total={meta.total}
                        hasNext={meta.hasNextPage}
                        hasPrev={meta.hasPreviousPage}
                    />
                </div>
            )}
            <CreateAppointmentModal
                isOpen={activeModal === "create_appointment"}
                onClose={closeModal}
            />
            <EditAppointmentModal
                isOpen={activeModal === "edit_appointment"}
                cita={selectedCita}
                onClose={closeModal}
            />
            <UpdateAppointmentStatusModal
                isOpen={activeModal === "mark_attended" || activeModal === "mark_canceled"}
                cita={selectedCita}
                type={activeModal}
                onClose={closeModal}
            />
            <DeleteAppointmentModal
                isOpen={activeModal === "delete_appointment"}
                cita={selectedCita}
                onClose={closeModal}
            />
        </div>
    );
};