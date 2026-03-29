/* eslint-disable react-hooks/static-components */
import { motion } from "motion/react";
import { FiHeadphones } from "react-icons/fi";
import type { Chat } from "../types";
import { formatChatDate, getCanalIcon, getEstadoChatConfig } from "../utils/chatFormatters";

interface ChatListItemProps {
    chat: Chat;
    onClick: () => void; 
}

export const ChatListItem = ({ chat, onClick }: ChatListItemProps) => {
    const CanalIcon = getCanalIcon(chat.canal);
    const { label, colorClass } = getEstadoChatConfig(chat.estado);

    const clienteName = chat.cliente 
        ? `${chat.cliente.nombres || ""} ${chat.cliente.apellidos || ""}`.trim() || "Cliente Anónimo"
        : "Usuario Desconocido";

    const asesorName = chat.asesor 
        ? `${chat.asesor.nombres || ""} ${chat.asesor.apellidos || ""}`.trim()
        : "Sin asignar";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onClick={onClick}
            className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shrink-0 bg-gray-50 dark:bg-gray-900 group-hover:scale-110 transition-transform ${chat.canal === 'WHATSAPP' ? 'text-green-500' : 'text-blue-500'}`}>
                    <CanalIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {clienteName}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                            {label}
                        </span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <FiHeadphones className="w-3.5 h-3.5" />
                            {asesorName}
                        </span>
                        <span className="flex items-center gap-1.5 opacity-60">
                            ID: {chat.id.slice(0, 8)}...
                        </span>
                    </div>
                </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                    {formatChatDate(chat.created_at)}
                </span>
            </div>
        </motion.div>
    );
};