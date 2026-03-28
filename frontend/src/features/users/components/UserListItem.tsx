import { motion } from "motion/react";
import { FiEdit2, FiTrash2, FiUser, FiMail, FiPhone } from "react-icons/fi";
import type { User } from "../types";

interface Props {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export const UserListItem = ({ user, onEdit, onDelete }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4 sm:gap-6 relative overflow-hidden"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${user.estado === 'ACTIVO' ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <div className="flex items-center gap-4 w-full md:w-2/6 shrink-0 pl-2">
                <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FiUser size={30} />
                </div>
                <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user.nombres} {user.apellidos}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {user.dni}
                        </span>
                    </p>
                </div>
            </div>
            <div className="flex flex-col w-full md:w-2/6 border-l-2 md:border-l-0 pl-3 md:pl-0 border-gray-100 dark:border-gray-800 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex items-center gap-2 mb-1">
                    <FiMail className="text-gray-400 shrink-0" size={14} />
                    {user.email}
                </p>
                {user.telefono && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FiPhone className="text-gray-400 shrink-0" size={12} />
                        {user.telefono}
                    </p>
                )}
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center w-full md:w-1/6 shrink-0 gap-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-max border border-gray-200 dark:border-gray-700">
                    <FiUser className="text-blue-500" size={20} />
                    {user.rol.nombre}
                </div>
                <span className={`px-2 py-0.5 text-sm font-bold rounded uppercase tracking-wide border ${
                    user.estado === 'ACTIVO' 
                        ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                }`}>
                    {user.estado}
                </span>
            </div>
            <div className="flex items-center justify-end w-full md:w-auto md:flex-1 gap-2 pt-2 md:pt-0 border-t border-gray-100 dark:border-gray-800 md:border-t-0">
                <button 
                    onClick={() => onEdit(user)}
                    className="p-2 cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                    title="Editar Usuario"
                >
                    <FiEdit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(user)}
                    className="p-2 cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    title="Eliminar Usuario"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
};