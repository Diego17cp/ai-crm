import { AnimatePresence, motion } from "motion/react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useUsers } from "../hooks/useUsers";
import type { User } from "../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const DeleteUserModal = ({ isOpen, onClose, user }: Props) => {
    const { useDeleteUserMutation } = useUsers();
    const mutation = useDeleteUserMutation(user?.id || "");

    const handleDelete = () => {
        if (!mutation) return;
        mutation.mutate(undefined, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Eliminar Usuario
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <FiAlertTriangle size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    ¿Estás seguro de eliminar a este usuario?
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Estás a punto de eliminar a <span className="font-bold text-gray-700 dark:text-gray-300">"{user.nombres} {user.apellidos}"</span>. Esta acción es <span className="font-bold text-red-500">irreversible</span> y todo su acceso al sistema será revocado inmediatamente.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="w-full cursor-pointer sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={mutation?.isPending}
                                className="w-full cursor-pointer sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-500/30"
                            >
                                {mutation?.isPending ? "Eliminando..." : "Sí, Eliminar Usuario"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};