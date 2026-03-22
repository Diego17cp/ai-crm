import { motion } from "motion/react";
import { FiMoreVertical, FiPhone, FiMail, FiMapPin, FiUser, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getSolvenciaColor, getActitudColor } from "../utils/leadsFormatters";
import { useState } from "react";
import { useClickOutside } from "@/shared/hooks";
import type { Lead } from "../types";

interface LeadCardProps {
    lead: Lead;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const LeadCard = ({ lead, onEdit, onDelete }: LeadCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useClickOutside(() => setIsMenuOpen(false));

    const fullName = [lead.nombres, lead.apellidos].filter(Boolean).join(" ") || "Sin Nombre";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all flex flex-col gap-4 relative"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                        {lead.nombres?.charAt(0)?.toUpperCase() || <FiUser size={20} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-1" title={fullName}>
                            {fullName}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {lead.tipo_doc?.nombre ? `${lead.tipo_doc.nombre}: ` : ""}
                            {lead.numero || "Sin documento"}
                        </span>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        <FiMoreVertical size={18} />
                    </button>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20"
                        >
                            <button
                                onClick={onEdit}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            >
                                <FiEdit2 size={14} /> Editar
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                            <button
                                onClick={onDelete}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-colors"
                            >
                                <FiTrash2 size={14} /> Eliminar
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 mt-1">
                {lead.telefonos && lead.telefonos.length > 0 ? (
                    lead.telefonos.map((tel) => (
                        <div key={tel.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FiPhone className="text-gray-400 shrink-0" />
                            <span className="truncate">
                                {tel.numero} <span className="text-xs opacity-60">({tel.tipo})</span>
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiPhone className="text-gray-400 shrink-0" />
                        <span>No especificado</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="text-gray-400 shrink-0" />
                    <span className="truncate">{lead.email || "No especificado"}</span>
                </div>
                {lead.ubigeo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiMapPin className="text-gray-400 shrink-0" />
                        <span className="truncate">{lead.ubigeo.nombre}</span>
                    </div>
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/60 flex flex-wrap gap-2">
                {lead.solvencia && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getSolvenciaColor(lead.solvencia)}`}>
                        {lead.solvencia.replace("_", " ")}
                    </span>
                )}
                {lead.actitud && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getActitudColor(lead.actitud)}`}>
                        {lead.actitud}
                    </span>
                )}
            </div>
        </motion.div>
    );
};