import { motion, AnimatePresence } from "motion/react";
import { FiPlus, FiRefreshCw, FiSearch, FiX, FiUsers } from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useLeads } from "../hooks/useLeads";
import { LeadCard } from "../components/LeadCard";
import { LeadListSkeleton } from "../components/LeadListSkeleton";
import { EmptyState, ErrorState, Pagination } from "@/shared/components";
import type { ApiError } from "@/core/types";
import { useLeadModals } from "../hooks/useLeadsModals";
import { EditLeadModal } from "../components/EditLeadModal";
import { CreateLeadModal } from "../components/CreateLeadModal";
import { DeleteLeadModal } from "../components/DeleteLeadModal";
import { classes, options } from "@/shared/constants";

const selectClasses = classes.searchableSelect;

const sexoOptions = options.sexo;
const estadoCivilOptions = options.estadoCivil;
const solvenciaOptions = options.solvencia;
const actitudOptions = options.actitud;

export const AllLeads = () => {
    const {
        leads,
        meta,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
        page,
        goToPage,
        searchTerm,
        handleSearch,
        clearSearch,
        filters,
        updateFilter,
        clearAllFilters,
        hasActiveFilters,
    } = useLeads();

    const { openModal, closeModal, selectedLead, activeModal } = useLeadModals();

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiUsers className="text-teal-600 dark:text-teal-500" /> Directorio de Leads
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona prospectos, clientes y su historial de interacciones.
                    </p>
                </motion.div>
                <div className="flex items-center gap-3">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={() => openModal("create_lead")}
                        className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
                    >
                        <FiPlus size={18} />
                        <span className="hidden sm:inline">Nuevo Lead</span>
                        <span className="sm:hidden">Nuevo</span>
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
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
                    <div className="relative w-full lg:w-96 shrink-0 z-50">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o correo..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                        />
                        <AnimatePresence>
                            {searchTerm && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 rounded-md"
                                >
                                    <FiX size={16} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="z-40">
                            <SearchableSelect
                                options={solvenciaOptions}
                                value={filters.solvencia || ""}
                                onChange={(val) => updateFilter("solvencia", val)}
                                placeholder="Solvencia"
                                classes={selectClasses}
                            />
                        </div>
                        <div className="z-30">
                            <SearchableSelect
                                options={actitudOptions}
                                value={filters.actitud || ""}
                                onChange={(val) => updateFilter("actitud", val)}
                                placeholder="Actitud"
                                classes={selectClasses}
                            />
                        </div>
                        <div className="z-20">
                            <SearchableSelect
                                options={estadoCivilOptions}
                                value={filters.estado_civil || ""}
                                onChange={(val) => updateFilter("estado_civil", val)}
                                placeholder="Estado Civil"
                                classes={selectClasses}
                            />
                        </div>
                        <div className="z-10">
                            <SearchableSelect
                                options={sexoOptions}
                                value={filters.sexo || ""}
                                onChange={(val) => updateFilter("sexo", val)}
                                placeholder="Sexo"
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
                                <FiX size={14} /> Limpiar todos los filtros
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <div className="w-full flex-1">
                {isLoading ? (
                    <LeadListSkeleton />
                ) : isError ? (
                    <ErrorState
                        error={error as ApiError}
                        onRetry={refetch}
                        title="Error al cargar leads"
                    />
                ) : leads.length === 0 ? (
                    <EmptyState
                        title={hasActiveFilters ? "No hay coincidencias" : "No hay leads registrados"}
                        description={
                            hasActiveFilters
                                ? "No encontramos leads que coincidan con los filtros aplicados. Intenta cambiar tu búsqueda."
                                : "Aún no has registrado ningún cliente potencial en tu base de datos."
                        }
                        icon={<FiUsers className="w-10 h-10 text-gray-400" />}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {leads.map(lead => (
                                <LeadCard 
                                    key={lead.id} 
                                    lead={lead}
                                    onEdit={() => openModal("edit_lead", lead)}
                                    onDelete={() => openModal("delete_lead", lead)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            {!isLoading && leads.length > 0 && meta && (
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
            <EditLeadModal
                isOpen={activeModal === "edit_lead"}
                onClose={closeModal}
                lead={selectedLead}
            />
            <CreateLeadModal
                isOpen={activeModal === "create_lead"}
                onClose={closeModal}
            />
            <DeleteLeadModal
                isOpen={activeModal === "delete_lead"}
                onClose={closeModal}
                lead={selectedLead}
            />
        </div>
    );
};