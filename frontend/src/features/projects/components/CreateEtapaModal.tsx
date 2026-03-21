import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiLayers, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import type { Proyecto } from "../types";
import { useEtapas } from "../hooks/useEtapas";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Proyecto | null;
}

export const CreateEtapaModal = ({ isOpen, onClose, project }: Props) => {
    const [nombre, setNombre] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { useCreateEtapaMutation } = useEtapas();
    const createEtapaMutation = useCreateEtapaMutation(project?.id || 0, nombre);

    const isSubmitting = createEtapaMutation.isPending;

    useEffect(() => {
        if (isOpen) {
            setNombre("");
            setError(null);
        }
    }, [isOpen]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, isSubmitting]);

    if (!project) return null;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const trimmedName = nombre.trim();
        if (!trimmedName) {
            setError("El nombre de la etapa es obligatorio.");
            return;
        }
        if (trimmedName.length < 3) {
            setError("El nombre debe tener al menos 3 caracteres.");
            return;
        }
        try {
            createEtapaMutation.mutate();
            onClose();
        } catch (error) {
            console.error("Error creating etapa:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
                        onClick={() => !isSubmitting && onClose()}
                    />
                    <div className="fixed inset-0 z-115 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
                                        <FiLayers size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            Nueva Etapa
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Para: <span className="font-semibold text-gray-700 dark:text-gray-300">{project.nombre}</span>
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
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginTop: -8 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm overflow-hidden"
                                        >
                                            <FiAlertCircle className="shrink-0" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="nombreEtapa" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        Nombre o Número de Etapa <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="nombreEtapa"
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => {
                                            setNombre(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="Ej: ETAPA 1, Los Pinos, etc."
                                        disabled={isSubmitting}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-60"
                                    />
                                </div>
                                {/* <div className="flex flex-col gap-1.5">
                                    <label htmlFor="estadoEtapa" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        Estado Inicial
                                    </label>
                                    <select
                                        id="estadoEtapa"
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-60 appearance-none cursor-pointer"
                                    >
                                        <option value="ACTIVO">Activo (Visible)</option>
                                        <option value="INACTIVO">Inactivo (Oculto)</option>
                                    </select>
                                </div> */}
                                <div className="mt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 cursor-pointer py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 cursor-pointer py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <BiLoaderAlt className="animate-spin text-lg" />
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            "Crear Etapa"
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