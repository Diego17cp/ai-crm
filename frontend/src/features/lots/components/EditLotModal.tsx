import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiEdit, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { useLots } from "../hooks/useLots";
import type { Lote } from "../types";
import type { ApiError } from "@/core/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lot: Lote | null;
}

export const EditLotModal = ({ isOpen, onClose, lot }: Props) => {
    const [numeroLote, setNumeroLote] = useState("");
    const [numeroPartida, setNumeroPartida] = useState("");
    const [areaM2, setAreaM2] = useState("");
    const [precioM2, setPrecioM2] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { useUpdateLoteMutation } = useLots();
    const updateLoteMutation = useUpdateLoteMutation(lot?.id || 0, {
        numero_lote: numeroLote,
        numero_partida: numeroPartida || undefined,
        area_m2: areaM2,
        precio_m2: precioM2,
        precio_total: String(Number(areaM2 || 0) * Number(precioM2 || 0)),
    });
    
    const isSubmitting = updateLoteMutation.isPending;

    useEffect(() => {
        if (isOpen && lot) {
            setNumeroLote(lot.numero_lote || "");
            setNumeroPartida(lot.numero_partida || "");
            setAreaM2(lot.area_m2 || "");
            setPrecioM2(lot.precio_m2 || "");
            setError(null);
        }
    }, [isOpen, lot]);

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

        if (!numeroLote.trim()) return setError("El número de lote es obligatorio.");
        if (!areaM2 || isNaN(Number(areaM2))) return setError("Área m² inválida.");
        if (!precioM2 || isNaN(Number(precioM2))) return setError("Precio m² inválido.");

        try {
            updateLoteMutation.mutate();
            onClose();
        } catch (err: unknown) {
            const message = (err as ApiError)?.response?.data?.message || "Error al editar el lote.";
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
                            className="bg-white dark:bg-gray-900 w-full max-w-2xl flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                                        <FiEdit size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            Editar Lote
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Lote: {lot.numero_lote} | Mz. {lot.manzana?.codigo}
                                        </p>
                                    </div>
                                </div>
                                <button type="button" onClick={onClose} disabled={isSubmitting} className="p-2 cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                                <FiAlertCircle className="shrink-0" /><span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 z-10">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Número de Lote <span className="text-red-500">*</span></label>
                                            <input type="text" value={numeroLote} onChange={(e) => setNumeroLote(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Partida Registral</label>
                                            <input type="text" value={numeroPartida} onChange={(e) => setNumeroPartida(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Área (m²) <span className="text-red-500">*</span></label>
                                            <input type="number" step="0.01" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Precio x m² (S/) <span className="text-red-500">*</span></label>
                                            <input type="number" step="0.01" value={precioM2} onChange={(e) => setPrecioM2(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all">
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={isSubmitting} className="px-8 cursor-pointer py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md flex gap-2 items-center transition-all">
                                            {isSubmitting ? <><BiLoaderAlt className="animate-spin" /> Guardando...</> : "Guardar Cambios"}
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