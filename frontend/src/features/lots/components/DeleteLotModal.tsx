import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { useLots } from "../hooks/useLots";
import type { Lote } from "../types";
import type { ApiError } from "@/core/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lot: Lote | null;
}

export const DeleteLotModal = ({ isOpen, onClose, lot }: Props) => {
    const [error, setError] = useState<string | null>(null);

    const { useDeleteLoteMutation } = useLots();
    const deleteMutation = useDeleteLoteMutation(lot?.id || 0);
    const isSubmitting = deleteMutation.isPending;

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

    if (!lot) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            deleteMutation.mutate();
            onClose();
        } catch (err: unknown) {
            const message = (err as ApiError)?.response?.data?.message || "Error al eliminar el lote.";
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
                                <div className="flex items-center gap-3 text-red-500">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
                                        <FiAlertTriangle size={24} />
                                    </div>
                                    <div className="flex flex-col mt-1">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                            Eliminar Lote
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                            <FiAlertCircle className="shrink-0" /><span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="text-sm text-gray-700 dark:text-gray-300 ml-1 leading-relaxed">
                                    ¿Estás completamente seguro de que deseas eliminar el lote <strong className="text-gray-900 dark:text-white uppercase">{lot.numero_lote}</strong> de la Mz {lot.manzana?.codigo}? 
                                    <br/><br/>
                                    Esta acción es  <strong className="text-red-500 dark:text-red-400">permanente e irreversible</strong>. No se podrá recuperar la información ni el historial de este lote.
                                </div>
                                <div className="mt-2 flex gap-3">
                                    <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300 font-semibold rounded-xl cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md cursor-pointer flex justify-center transition-all items-center gap-2">
                                        {isSubmitting ? <><BiLoaderAlt className="animate-spin text-lg" /><span>Eliminando...</span></> : "Sí, Eliminar"}
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