import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiMoreVertical, FiMap, FiMaximize2, FiDollarSign, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import type { Lote, EstadoLote } from "../types";

interface Props {
    lote: Lote;
    onEdit?: () => void;
    onDelete?: () => void;
}

const statusConfig: Record<EstadoLote, { color: string; label: string }> = {
    Disponible: { color: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border-teal-200 dark:border-teal-800", label: "Disponible" },
    Vendido: { color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800", label: "Vendido" },
    Reservado: { color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800", label: "Reservado" },
};

export const LotCard = ({ lote, onEdit, onDelete }: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const statusStyle = statusConfig[lote.estado] || statusConfig.Disponible;
    const principalImage = lote.imagenes?.find(img => img.es_principal)?.url_imagen || lote.imagenes?.[0]?.url_imagen;
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const formattedPrice = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(lote.precio_total));

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all overflow-hidden relative group"
        >
            <div className="relative h-40 bg-gray-100 dark:bg-gray-800 w-full overflow-hidden flex items-center justify-center">
                {principalImage ? (
                    <img 
                        src={principalImage} 
                        alt={`Lote ${lote.numero_lote}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                        <FiImage size={32} className="opacity-50 mb-2" />
                        <span className="text-xs font-medium uppercase tracking-wider">Sin Imagen</span>
                    </div>
                )}                
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-sm ${statusStyle.color}`}>
                    {statusStyle.label}
                </div>
                <div className="absolute top-3 right-3" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-2 cursor-pointer bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-xl transition-all shadow-sm"
                    >
                        <FiMoreVertical size={18} />
                    </button>
                    
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10, transformOrigin: "top right" }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                            >
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onEdit?.(); }}
                                    className="w-full cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                                >
                                    <FiEdit2 size={14} className="text-blue-500" />
                                    Editar Lote
                                </button>
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onDelete?.(); }}
                                    className="w-full cursor-pointer flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left font-medium"
                                >
                                    <FiTrash2 size={14} />
                                    Eliminar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            Lote {lote.numero_lote}
                        </h3>
                        {lote.numero_partida && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Partida: <span className="font-semibold">{lote.numero_partida}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-3 mt-1">
                    <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 shrink-0">
                            <FiMap size={14} />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {lote.manzana?.etapa?.proyecto?.nombre || 'Proyecto'}
                            </span>
                            <span className="text-xs">
                                {lote.manzana?.etapa?.nombre || 'Etapa'} • Mz. {lote.manzana?.codigo || '---'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="p-1.5 bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg shrink-0">
                            <FiMaximize2 size={14} />
                        </div>
                        <span>
                            <strong className="text-gray-800 dark:text-gray-200">{lote.area_m2}</strong> m²
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="p-1.5 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg shrink-0">
                            <FiDollarSign size={14} />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-base">
                            {formattedPrice}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                            S/ {lote.precio_m2} x m²
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};