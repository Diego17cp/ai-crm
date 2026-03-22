import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import type { Lead } from "../types";
import { useLeads } from "../hooks/useLeads";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
}

export const DeleteLeadModal = ({ isOpen, onClose, lead }: Props) => {
    const [error, setError] = useState<string | null>(null);

    const { useDeleteLeadMutation } = useLeads();
    const deleteLeadMutation = useDeleteLeadMutation(lead?.id || 0);
    const isSubmitting = deleteLeadMutation.isPending;

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

    if (!lead) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            deleteLeadMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        } catch (err: unknown) {
            console.error("Error eliminando el lead:", err);
            setError("Error al intentar eliminar el cliente.");
        }
    };
    const fullName = [lead.nombres, lead.apellidos].filter(Boolean).join(" ") || "Sin Nombre";
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
                                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                                        <FiAlertTriangle size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            Eliminar Lead
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-50" title={fullName}>
                                            {fullName}
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
                                    ¿Estás seguro de que deseas eliminar permanentemente a <strong className="text-gray-900 dark:text-white">{fullName}</strong>? 
                                    <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">Esta acción también eliminará su historial asociado y no se puede deshacer.</span>
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
                                        className="flex-1 cursor-pointer py-3 px-4 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-500/20"
                                    >
                                        {isSubmitting ? (
                                            <><BiLoaderAlt className="animate-spin text-lg" /><span>Eliminando...</span></>
                                        ) : (
                                            "Sí, Eliminar Lead"
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