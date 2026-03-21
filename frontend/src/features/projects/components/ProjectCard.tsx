import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Proyecto } from "../types";
import { getBadgeStyle } from "../utils/stateColors";
import { FiMapPin, FiLayers, FiBox, FiMoreVertical, FiEdit2, FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { useClickOutside } from "@/shared/hooks";

interface Props {
    project: Proyecto;
    onViewDetails: () => void;
    onEdit?: () => void;
    onAddEtapa?: () => void;
    onToggle?: () => void;
}

export const ProjectCard = ({ project, onViewDetails, onEdit, onAddEtapa, onToggle }: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useClickOutside(() => setIsMenuOpen(false));

    const totalManzanas = project.etapas.reduce((acc, etapa) => acc + etapa.manzanas.length, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4 group"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                            {project.nombre}
                        </h3>
                        {project.abreviatura && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                                {project.abreviatura}
                            </span>
                        )}
                        <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg ${getBadgeStyle(project.estado)}`}>
                            {project.estado}
                        </span>
                    </div>
                    {project.ubicacion && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <FiMapPin className="shrink-0" />
                            <span className="line-clamp-1">{project.ubicacion}</span>
                        </div>
                    )}
                </div>                                
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`shrink-0 cursor-pointer p-2 rounded-full transition-colors ${
                            isMenuOpen 
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white opacity-100" 
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        }`}
                    >
                        <FiMoreVertical size={18} />
                    </button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-20 origin-top-right overflow-hidden"
                            >
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onEdit?.(); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <FiEdit2 size={15} /> Editar Proyecto
                                </button>
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onAddEtapa?.(); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <FiPlusCircle size={15} /> Agregar Etapa
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onToggle?.(); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm ${project.estado === "ACTIVO" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"} hover:bg-${project.estado === "ACTIVO" ? "red" : "green"}-50 dark:hover:bg-${project.estado === "ACTIVO" ? "red" : "green"}-900/20 flex items-center gap-2 transition-colors cursor-pointer font-medium`}
                                >
                                    <FiTrash2 size={15} /> Eliminar Proyecto
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-10">
                {project.descripcion || "Sin descripción proporcionada para este proyecto inmobiliario."}
            </p>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <FiLayers size={14} /> Etapas
                        </span>
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5 ml-5">
                            {project.etapas.length}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <FiBox size={14} /> Manzanas
                        </span>
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5 ml-5">
                            {totalManzanas}
                        </span>
                    </div>
                </div>
                <button 
                    className="text-sm cursor-pointer font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-500 dark:hover:text-teal-400 transition-colors"
                    onClick={onViewDetails}
                >
                    Ver detalle &rarr;
                </button>
            </div>
        </motion.div>
    );
};