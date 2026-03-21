import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiGrid, FiAlertCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import type { Proyecto, Etapa } from "../types";
import { useManzanas } from "../hooks/useManzanas";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Proyecto | null;
    etapa: Etapa | null;
}

export const CreateManzanaModal = ({ isOpen, onClose, project, etapa }: Props) => {
    const [codigos, setCodigos] = useState<string[]>([""]);
    const [error, setError] = useState<string | null>(null);

    const { useCreateManzana } = useManzanas();

    const createManzanaMutation = useCreateManzana(etapa?.id || 0, codigos);

    const isSubmitting = createManzanaMutation.isPending; 

    useEffect(() => {
        if (isOpen) {
            setCodigos([""]);
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

    if (!project || !etapa) return null;

    const handleAddInput = () => setCodigos([...codigos, ""]);

    const handleRemoveInput = (index: number) => {
        if (codigos.length === 1) return;
        const newCodigos = codigos.filter((_, i) => i !== index);
        setCodigos(newCodigos);
    };

    const handleChange = (index: number, value: string) => {
        const newCodigos = [...codigos];
        newCodigos[index] = value;
        setCodigos(newCodigos);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const limpiarCodigos = codigos.map(c => c.trim()).filter(c => c !== "");
        if (limpiarCodigos.length === 0) {
            setError("Debes ingresar al menos un código de manzana.");
            return;
        }
        try {
            createManzanaMutation.mutate();
            onClose();
        } catch (err: unknown) {
            console.error("Error al crear manzanas:", err);
            setError("Error al crear manzanas");
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
                            className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                        <FiGrid size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            Añadir Manzanas
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Etapa: <span className="font-semibold text-gray-700 dark:text-gray-300">{etapa.nombre}</span>
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
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-2"
                                            >
                                                <FiAlertCircle className="shrink-0" /><span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                            Códigos de Manzanas <span className="text-red-500">*</span>
                                        </label>
                                        <AnimatePresence initial={false}>
                                            {codigos.map((codigo, idx) => (
                                                <motion.div 
                                                    key={codigo}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        value={codigo}
                                                        onChange={(e) => handleChange(idx, e.target.value)}
                                                        placeholder={`Ej: A, B, MZ-1, etc.`}
                                                        disabled={isSubmitting}
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60 uppercase"
                                                    />
                                                    {codigos.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveInput(idx)}
                                                            disabled={isSubmitting}
                                                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                                        >
                                                            <FiTrash2 size={20} />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddInput}
                                        disabled={isSubmitting}
                                        className="w-full py-3 mt-1 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <FiPlus size={18} /> Añadir otra manzana
                                    </button>
                                </div>
                                <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
                                    <div className="flex gap-3">
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
                                            className="flex-1 cursor-pointer py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <><BiLoaderAlt className="animate-spin text-lg" /><span>Creando...</span></>
                                            ) : (
                                                "Crear Manzanas"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};