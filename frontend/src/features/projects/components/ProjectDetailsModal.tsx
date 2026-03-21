import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiMapPin, FiCalendar, FiLayers, FiBox, FiPlusCircle, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import type { Etapa, Manzana, Proyecto } from "../types";
import { getBadgeStyle } from "../utils/stateColors";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Proyecto | null;
    onAddEtapa?: (project: Proyecto) => void;
    onEditEtapa?: (project: Proyecto, etapa: Etapa) => void;
    onToggleEtapaStatus?: (project: Proyecto, etapa: Etapa) => void;
    onCreateManzana?: (project: Proyecto, etapa: Etapa) => void;
    onEditManzana?: (project: Proyecto, etapa: Etapa, manzana: Manzana) => void;
    onToggleManzanaStatus?: (project: Proyecto, etapa: Etapa, manzana: Manzana) => void;
}

export const ProjectDetailsModal = ({ 
    isOpen, 
    onClose, 
    project, 
    onAddEtapa, 
    onEditEtapa, 
    onToggleEtapaStatus, 
    onCreateManzana,
    onEditManzana,
    onToggleManzanaStatus
}: Props) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!project) return null;

    const totalManzanas = project.etapas.reduce((acc, etapa) => acc + etapa.manzanas.length, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-100"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-105 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                                            {project.nombre}
                                        </h2>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg ${getBadgeStyle(project.estado)}`}>
                                            {project.estado}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        ID Interno: #{project.id} | Código: {project.abreviatura || "N/A"}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={onClose}
                                    className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors shrink-0"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto main-scrollbar flex flex-col gap-6">                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 shrink-0">
                                        <div className="p-2 bg-white dark:bg-gray-900 rounded-xl text-teal-600 dark:text-teal-400 shadow-sm">
                                            <FiMapPin size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                {project.ubicacion || "No especificada"}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1">
                                                Ubigeo: {" "}
                                                <span className="font-medium text-[10px]">{project.ubigeo.nombre}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 shrink-0">
                                        <div className="p-2 bg-white dark:bg-gray-900 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                                            <FiCalendar size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fechas Clave</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                Creado: {new Date(project.created_at).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1">
                                                Editado: {new Date(project.updated_at).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Descripción del Proyecto
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        {project.descripcion || "Sin descripción detallada por el momento."}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <span>Estructura del Proyecto</span>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md">
                                                {project.etapas.length} Etapas • {totalManzanas} Manzanas
                                            </span>
                                        </h4>
                                        <button 
                                            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                            onClick={() => onAddEtapa?.(project)}
                                        >
                                            <FiPlusCircle /> Añadir Etapa
                                        </button>
                                    </div>
                                    
                                    {project.etapas.length === 0 ? (
                                        <div className="text-sm text-center py-6 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                            Aún no hay etapas registradas.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {project.etapas.map((etapa) => (
                                                <div key={etapa.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex flex-col gap-3 group/etapa transition-colors hover:border-teal-500/30 shadow-sm relative">                                                    
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover/etapa:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-900 pl-2">
                                                        <button 
                                                            className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                            title="Agregar Manzana"
                                                            onClick={() => onCreateManzana && onCreateManzana(project, etapa)}
                                                        >
                                                            <FiPlusCircle size={14} />
                                                        </button>
                                                        <button 
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                            title="Editar Etapa"
                                                            onClick={() => onEditEtapa && onEditEtapa(project, etapa)}>
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => onToggleEtapaStatus && onToggleEtapaStatus(project, etapa)}
                                                            className={`p-1.5 text-gray-400 ${etapa.estado === 'ACTIVO' ? 'hover:text-red-600 dark:hover:text-red-400' : 'hover:text-green-600 dark:hover:text-green-400'} rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
                                                            title={etapa.estado === 'ACTIVO' ? 'Desactivar etapa' : 'Activar etapa'}
                                                        >
                                                            {etapa.estado === 'ACTIVO' ? <FiTrash2 size={16} /> : <FiRefreshCw size={16} />}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <FiLayers className="text-teal-500" />
                                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{etapa.nombre}</span>
                                                        </div>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 px-2 py-0.5 rounded-md">
                                                            {etapa.estado}
                                                        </span>
                                                    </div>
                                                    {etapa.manzanas.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {etapa.manzanas.map(mz => (
                                                                <div key={mz.id} className="group/mz relative flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg border border-gray-200/60 dark:border-gray-700 font-medium pb-1.5 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                                                    <FiBox size={11} className="text-gray-400 group-hover/mz:text-blue-500" />
                                                                    Mz {mz.codigo}                                                                    
                                                                    <div className="absolute inset-0 bg-gray-900/80 rounded-lg opacity-0 group-hover/mz:opacity-100 transition-opacity flex items-center justify-center gap-2 Backdrop-blur-sm">
                                                                        <button 
                                                                            className="text-white cursor-pointer hover:text-blue-300"
                                                                            title="Editar" 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onEditManzana?.(project, etapa, mz);
                                                                            }}
                                                                        >
                                                                            <FiEdit2 size={12} />
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onToggleManzanaStatus?.(project, etapa, mz);
                                                                            }}
                                                                            className={`p-1.5 text-gray-400 ${mz.estado === 'ACTIVO' ? 'hover:text-red-600 dark:hover:text-red-400' : 'hover:text-green-600 dark:hover:text-green-400'} rounded-md transition-colors cursor-pointer`}
                                                                            title={mz.estado === 'ACTIVO' ? 'Desactivar manzana' : 'Activar manzana'}
                                                                        >
                                                                            {mz.estado === 'ACTIVO' ? <FiTrash2 size={16} /> : <FiRefreshCw size={16} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Sin manzanas configuradas en esta etapa.</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};