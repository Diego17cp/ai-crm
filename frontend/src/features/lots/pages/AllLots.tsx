import { motion } from "motion/react";
import { FiPlus, FiSearch, FiX, FiRefreshCw, FiFilter, FiMapPin } from "react-icons/fi";
import { useLots } from "../hooks/useLots";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { Pagination } from "@/shared/components/Pagination";
import type { ApiError } from "@/core/types";
import { LotListSkeleton } from "../components/LotListSkeleton";
import { LotCard } from "../components/LotCard";
import type { Etapa, Manzana, Proyecto } from "@/features/projects/types";
import { SearchableSelect } from "dialca-ui";
import { useLotModals } from "../hooks/useLotModals";
import { CreateLotModal } from "../components/CreateLotModal";
import { EditLotModal } from "../components/EditLotModal";
import { DeleteLotModal } from "../components/DeleteLotModal";

export const AllLots = () => {
    const {
        lotes,
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
        proyectos,
        loadingProyectos,
        errorProyectos,
        etapas,
        loadingEtapas,
        errorEtapas,
        manzanas,
        loadingManzanas,
        errorManzanas
    } = useLots();

    const proyectoOptions = proyectos?.map((p: Proyecto) => ({ value: String(p.id), label: p.nombre })) || [];
    const etapaOptions = etapas?.map((e: Etapa) => ({ value: String(e.id), label: e.nombre })) || [];
    const manzanaOptions = manzanas?.map((m: Manzana) => ({ value: String(m.id), label: `Mz ${m.codigo}` })) || [];
    const estadoOptions = [
        { value: "Disponible", label: "Disponible" },
        { value: "Reservado", label: "Reservado" },
        { value: "Vendido", label: "Vendido" }
    ];

    const selectClasses = {
        input: "bg-gray-50! dark:bg-gray-800/50! border-transparent! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! rounded-xl! disabled:opacity-50! text-sm! py-2.5!",
        option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40! text-sm!",
        dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
        clearButton: "dark:text-gray-400! dark:hover:text-gray-200!"
    };

    const { openModal, closeModal, activeModal, selectedLot } = useLotModals();

    return (
        <div className="flex flex-col gap-6 w-full max-w-350 mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Directorio de Lotes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona y monitorea el estado individual de cada lote.
                    </p>
                </motion.div>
                <div className="flex items-center gap-2">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={() => openModal("create_lot")}
                        className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
                    >
                        <FiPlus size={18} />
                        <span>Nuevo Lote</span>
                    </motion.button>
                    <button 
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Recargar datos"
                        className="p-3.5 cursor-pointer shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50 ml-auto"
                    >
                        <FiRefreshCw className={isFetching ? "animate-spin" : ""} size={18} />
                    </button>
                </div>
            </div>
            <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-3"
            >
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
                    <div className="relative w-full flex items-center">
                        <FiSearch className="absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar por código (Ej: L-01), cliente..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-11 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none"
                        />
                        {searchTerm ? (
                            <button 
                                onClick={clearSearch}
                                className="absolute cursor-pointer right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-800 rounded-full"
                            >
                                <FiX size={16} />
                            </button>
                        ) : null}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto pb-1 sm:pb-0">
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="flex cursor-pointer items-center gap-1.5 shrink-0 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium border border-transparent"
                            >
                                <FiFilter size={16} />
                                <span className="hidden sm:inline">Limpiar</span>
                            </button>
                        )}
                        
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-100 dark:border-gray-800/60 pt-3">
                    <div className="flex flex-col z-40">
                        {loadingProyectos ? (
                            <div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm animate-pulse">
                                Cargando proyectos...
                            </div>
                        ) : errorProyectos ? (
                            <div className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm">
                                Error al cargar proyectos
                            </div>
                        ) : (
                            <SearchableSelect
                                options={proyectoOptions}
                                value={filters.id_proyecto ? String(filters.id_proyecto) : ""}
                                onChange={(val) => updateFilter("id_proyecto", val ? Number(val) : undefined)}
                                placeholder="Todos los Proyectos"
                                isClearable
                                classes={selectClasses}
                            />
                        )}
                    </div>
                    <div className="flex flex-col z-30">
                        {loadingEtapas ? (
                            <div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm animate-pulse">
                                Cargando etapas...
                            </div>
                        ) : errorEtapas ? (
                            <div className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm">
                                Error al cargar etapas
                            </div>
                        ) : (
                            <SearchableSelect 
                                options={etapaOptions}
                                value={filters.id_etapa ? String(filters.id_etapa) : ""}
                                onChange={(val) => updateFilter("id_etapa", val ? Number(val) : undefined)}
                                placeholder="Todas las Etapas"
                                disabled={!filters.id_proyecto}
                                isClearable
                                classes={selectClasses}
                            />
                        )}
                    </div>
                    <div className="flex flex-col z-20">
                        {loadingManzanas ? (
                            <div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm animate-pulse">
                                Cargando manzanas...
                            </div>
                        ) : errorManzanas ? (
                            <div className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm">
                                Error al cargar manzanas
                            </div>
                        ) : (
                            <SearchableSelect 
                                options={manzanaOptions}
                                value={filters.id_manzana ? String(filters.id_manzana) : ""}
                                onChange={(val) => updateFilter("id_manzana", val ? Number(val) : undefined)}
                                placeholder="Todas las Manzanas"
                                disabled={!filters.id_etapa}
                                isClearable
                                classes={selectClasses}
                            />
                        )}
                    </div>
                    <div className="flex flex-col z-10">
                        <SearchableSelect
                            options={estadoOptions}
                            value={filters.estado || ""}
                            onChange={(val) => updateFilter("estado", val || undefined)}
                            placeholder="Todos los Estados"
                            isClearable
                            classes={selectClasses}
                        />
                    </div>
                </div>
            </motion.div>
            <div className="w-full flex-1">
                {isLoading ? (
                    <LotListSkeleton />
                ) : isError ? (
                    <ErrorState
                        error={error as ApiError}
                        onRetry={refetch}
                        title="Error al cargar lotes"
                    />
                ) : lotes.length === 0 ? (
                    <EmptyState
                        title={hasActiveFilters ? "No hay coincidencias" : "No hay lotes registrados"}
                        description={
                            hasActiveFilters 
                            ? "No encontramos lotes que coincidan con los filtros aplicados. Intenta cambiar tu búsqueda."
                            : "Aún no has registrado ningún lote en tus proyectos."
                        }
                        icon={<FiMapPin className="w-10 h-10 text-gray-400" />}
                    />
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        >
                            {lotes.map(lote => (
                                <LotCard
                                    key={lote.id} 
                                    lote={lote} 
                                    onEdit={() => openModal("edit_lot", lote)}
                                    onDelete={() => openModal("delete_lot", lote)}
                                />
                            ))}
                        </motion.div>
                        
                        {meta && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={page}
                                    perPage={meta.limit}
                                    total={meta.total}
                                    totalPages={meta.totalPages}
                                    hasNext={meta.hasNextPage}
                                    hasPrev={meta.hasPreviousPage}
                                    onPageChange={goToPage}
                                    isLoading={isFetching}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
            <CreateLotModal 
                isOpen={activeModal === "create_lot"} 
                onClose={closeModal} 
                proyectos={proyectos} 
            />
            <EditLotModal 
                isOpen={activeModal === "edit_lot"} 
                onClose={closeModal} 
                lot={selectedLot} 
            />
            <DeleteLotModal 
                isOpen={activeModal === "delete_lot"} 
                onClose={closeModal} 
                lot={selectedLot} 
            />
        </div>
    );
};