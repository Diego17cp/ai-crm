import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiAlertTriangle, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import type { Proyecto } from "../types";
import { useProjects } from "../hooks/useProjects";
import type { ApiError } from "@/core/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Proyecto | null;
}

export const ToggleProjectStatusModal = ({ isOpen, onClose, project }: Props) => {
    const [error, setError] = useState<string | null>(null);

    const { useToggleProjectStatusMutation } = useProjects();
    const toggleProjectMutation = useToggleProjectStatusMutation(project ? project.id : 0);
    const isSubmitting = toggleProjectMutation.isPending;

    const isActiva = project?.estado === "ACTIVO";

    useEffect(() => {
        if (isOpen) setError(null);
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, isSubmitting]);

    if (!project) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            toggleProjectMutation.mutate();
            onClose();
        } catch (err: unknown) {
            const message = (err as ApiError)?.response?.data?.message || "Error al actualizar estado del proyecto";
            setError(message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
                        onClick={() => !isSubmitting && onClose()}
                    />
                    <div className="fixed inset-0 z-115 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isActiva ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'}`}>
                                        {isActiva ? <FiAlertTriangle size={20} /> : <FiCheckCircle size={20} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            {isActiva ? "Desactivar Proyecto" : "Activar Proyecto"}
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Confirmación requerida
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
                                        >
                                            <FiAlertCircle className="shrink-0" /><span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="text-sm text-gray-700 dark:text-gray-300 ml-1 leading-relaxed">
                                    {isActiva 
                                        ? <>¿Estás seguro de que deseas desactivar el proyecto <strong className="text-gray-900 dark:text-white uppercase">{project.nombre}</strong>? Esta acción ocultará todas sus etapas y lotes asociados en ciertas vistas.</>
                                        : <>¿Deseas volver a activar el proyecto <strong className="text-gray-900 dark:text-white uppercase">{project.nombre}</strong>? Volverá a estar disponible para su operativa normal junto a todos sus componentes.</>
                                    }
                                </div>

                                <div className="mt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 cursor-pointer py-3 px-4 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                                            isActiva 
                                            ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-500/20' 
                                            : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-teal-500/20'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <><BiLoaderAlt className="animate-spin text-lg" /><span>Procesando...</span></>
                                        ) : (
                                            isActiva ? "Sí, Desactivar" : "Sí, Activar"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};