import type { ApiError } from "@/core/types";
import { LeadCard } from "@/features/leads/components/LeadCard";
import { LeadListSkeleton } from "@/features/leads/components/LeadListSkeleton";
import { ErrorState, EmptyState, Pagination } from "@/shared/components";
import { SearchableSelect } from "dialca-ui";
import { AnimatePresence, motion } from "motion/react";
import { FiRefreshCw, FiSearch, FiUsers, FiX } from "react-icons/fi";
import { useClients } from "../hooks/useClients";
import { useClientModals } from "../hooks/useClientsModals";
import { toast } from "sonner";
import { EditClientModal } from "../components/EditClientModal";

const selectClasses = {
    input: "bg-gray-50! dark:bg-gray-800/50! border-transparent! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! rounded-xl! disabled:opacity-50! text-sm! py-2.5!",
    option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40! text-sm!",
    dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
    clearButton: "dark:text-gray-400! dark:hover:text-gray-200!"
};

const sexoOptions = [{ value: "M", label: "Masculino" }, { value: "F", label: "Femenino" }];
const estadoCivilOptions = [
    { value: "SOLTERO", label: "Soltero/a" },
    { value: "CASADO", label: "Casado/a" },
    { value: "DIVORCIADO", label: "Divorciado/a" },
    { value: "CONVIVIENTE", label: "Conviviente" }
];
const solvenciaOptions = [
    { value: "EXCELENTE", label: "Excelente" },
    { value: "BUEN_PAGADOR", label: "Buen Pagador" },
    { value: "PAGA ATRASADO", label: "Paga Atrasado" },
    { value: "MOROSO", label: "Moroso" },
    { value: "DESCARTADO", label: "Descartado" }
];
const actitudOptions = [
    { value: "AMABLE", label: "Amable" },
    { value: "ENOJADO", label: "Enojado" },
    { value: "DESCONFIADO", label: "Desconfiado" },
    { value: "QUEJOSO", label: "Quejoso" }
];

export const AllCustomers = () => {
    const {
        clients,
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
    } = useClients();
    const { activeModal, selectedClient, openModal, closeModal } = useClientModals();
	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<FiUsers className="text-teal-600 dark:text-teal-500" />{" "}
						Directorio de Clientes
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Visualiza y gestiona todos los clientes activos en tu CRM. Aquí puedes revisar detalles, actualizar información y mantener tu base de datos de clientes siempre al día.
					</p>
				</motion.div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Recargar datos"
                        className="p-3 flex items-center gap-2 cursor-pointer shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50"
                    >
                        <FiRefreshCw className={isFetching ? "animate-spin" : ""} size={18} />
                        <span>Recargar</span>
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
                        title="Error al cargar clientes"
                    />
                ) : clients.length === 0 ? (
                    <EmptyState
                        title={hasActiveFilters ? "No hay coincidencias" : "No hay clientes registrados"}
                        description={
                            hasActiveFilters
                                ? "No encontramos clientes que coincidan con los filtros aplicados. Intenta cambiar tu búsqueda."
                                : "Aún no has registrado ningún cliente activo en tu base de datos."
                        }
                        icon={<FiUsers className="w-10 h-10 text-gray-400" />}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {clients.map(client => (
                                <LeadCard 
                                    key={client.id} 
                                    lead={client}
                                    onEdit={() => openModal("edit_client", client)}
                                    onDelete={() => toast.warning("Un cliente no puede ser eliminado.")}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            {!isLoading && clients.length > 0 && meta && (
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
            <EditClientModal
                isOpen={activeModal === "edit_client"}
                onClose={closeModal}
                client={selectedClient}
            />
		</div>
	);
};
