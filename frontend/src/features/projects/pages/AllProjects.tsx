import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectListSkeleton } from "../components/ProjectListSkeleton";
import { Pagination } from "@/shared/components/Pagination";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { FiPlus, FiBox, FiSearch, FiX, FiRefreshCw } from "react-icons/fi";
import { motion } from "motion/react";
import type { ApiError } from "@/core/types";
import { useProjectModals } from "../hooks/useProjectModal";
import { ProjectDetailsModal } from "../components/ProjectDetailsModal";
import { CreateEtapaModal } from "../components/CreateEtapaModal";
import { EditEtapaModal } from "../components/EditEtapaModal";
import { ToggleEtapaStatusModal } from "../components/ToggleEtapaStatusModal";
import { CreateManzanaModal } from "../components/CreateManzanasModal";
import { EditManzanaModal } from "../components/EditManzanaModal";
import { ToggleManzanaStatusModal } from "../components/ToggleManzanaStatusModal";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { ToggleProjectStatusModal } from "../components/ToggleProjectStatusModal";
import { EditProjectModal } from "../components/EditProjectModal";

export const AllProjects = () => {
    const {
        projects,
        meta,
        isLoading,
        isError,
        error,
        refetch,
        page,
        goToPage,
        searchTerm,
        handleSearch,
        clearSearch,
        isFetching
    } = useProjects();

    const {
        activeModal,
        selectedProject,
        selectedEtapa,
        selectedManzana,
        openModal,
        closeModal
    } = useProjectModals();

    const noResultsForSearch = searchTerm && projects.length === 0;

    return (
        <div className="flex flex-col gap-6 w-full max-w-350 mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Proyectos Inmobiliarios
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona el inventario de tus proyectos, etapas y manzanas.
                    </p>
                </motion.div>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    onClick={() => openModal("create_project")}
                >
                    <FiPlus size={18} />
                    <span>Nuevo Proyecto</span>
                </motion.button>
            </div>
            <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-900 p-2 md:p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
                <div className="relative w-full sm:max-w-md flex items-center">
                    <FiSearch className="absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre, abreviatura o ubicación..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-11 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none"
                    />
                    {searchTerm && isFetching ? (
                        <FiRefreshCw className="absolute right-3 text-gray-400 animate-spin" size={18} />
                    ) : searchTerm ? (
                        <button 
                            onClick={clearSearch}
                            className="absolute cursor-pointer right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-800 rounded-full"
                            title="Limpiar búsqueda"
                        >
                            <FiX size={16} />
                        </button>
                    ) : null}
                </div>
                <button 
                    onClick={() => refetch()}
                    disabled={isFetching}
                    title="Recargar datos"
                    className="p-2.5 cursor-pointer sm:ml-auto rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50"
                >
                    <FiRefreshCw className={isFetching ? "animate-spin" : ""} size={18} />
                </button>
            </motion.div>
            <div className="w-full flex-1">
                {isLoading ? (
                    <ProjectListSkeleton />
                ) : isError ? (
                    <ErrorState
                        error={error as ApiError}
                        onRetry={refetch}
                        title="Error al cargar proyectos"
                    />
                ) : projects.length === 0 ? (
                    <EmptyState
                        title={noResultsForSearch ? "No hay coincidencias" : "No hay proyectos registrados"}
                        description={
                            noResultsForSearch 
                            ? `No encontramos proyectos que coincidan con "${searchTerm}". Intenta con otra palabra.`
                            : "Agrega un nuevo proyecto para comenzar a gestionar sus etapas y lotes."
                        }
                        icon={<FiBox className="w-10 h-10 text-gray-400" />}
                    />
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        >
                            {projects.map((project) => (
                                <ProjectCard 
                                    key={project.id} 
                                    project={project} 
                                    onViewDetails={() => openModal("details", project)}
                                    onAddEtapa={() => openModal("create_etapa", project)}
                                    onEdit={() => openModal("edit_project", project)}
                                    onToggle={() => openModal("toggle_project_status", project)}
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
            <ProjectDetailsModal
                isOpen={activeModal === "details"}
                onClose={closeModal}
                project={selectedProject}
                onAddEtapa={(p) => openModal("create_etapa", p)}
                onEditEtapa={(p, e) => openModal("edit_etapa", p, e)}
                onToggleEtapaStatus={(p, e) => openModal("toggle_etapa_status", p, e)}
                onCreateManzana={(p, e) => openModal("create_manzana", p, e)}
                onEditManzana={(p, e, m) => openModal("edit_manzana", p, e, m)}
                onToggleManzanaStatus={(p, e, m) => openModal("toggle_manzana_status", p, e, m)}
            />
            <CreateEtapaModal
                isOpen={activeModal === "create_etapa"}
                onClose={closeModal}
                project={selectedProject}
            />
            <EditEtapaModal
                isOpen={activeModal === "edit_etapa"}
                onClose={closeModal}
                project={selectedProject}
                etapa={selectedEtapa}
            />
            <ToggleEtapaStatusModal
                isOpen={activeModal === "toggle_etapa_status"}
                onClose={closeModal}
                project={selectedProject}
                etapa={selectedEtapa}
            />
            <CreateManzanaModal
                isOpen={activeModal === "create_manzana"}
                onClose={closeModal}
                project={selectedProject}
                etapa={selectedEtapa}
            />
            <EditManzanaModal
                isOpen={activeModal === "edit_manzana"}
                onClose={closeModal}
                project={selectedProject}
                etapa={selectedEtapa}
                manzana={selectedManzana}
            />
            <ToggleManzanaStatusModal
                isOpen={activeModal === "toggle_manzana_status"}
                onClose={closeModal}
                project={selectedProject}
                etapa={selectedEtapa}
                manzana={selectedManzana}
            />
            <CreateProjectModal
                isOpen={activeModal === "create_project"}
                onClose={closeModal}
            />
            <EditProjectModal
                isOpen={activeModal === "edit_project"}
                onClose={closeModal}
                project={selectedProject}
            />
            <ToggleProjectStatusModal
                isOpen={activeModal === "toggle_project_status"}
                onClose={closeModal}
                project={selectedProject}
            />
        </div>
    );
};
