import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading = false }: Props) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, isLoading]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-100"
                        onClick={() => !isLoading && onClose()}
                    />                    
                    <div className="fixed inset-0 z-105 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4 text-center items-center"
                        >
                            <div className="size-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-2">
                                <FiAlertCircle className="text-3xl" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    ¿Cerrar sesión?
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-65 mx-auto">
                                    Estás a punto de finalizar tu sesión activa. Tendrás que volver a ingresar tus credenciales.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 w-full mt-4">
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="w-full cursor-pointer relative flex items-center justify-center bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <BiLoaderAlt className="animate-spin text-xl mr-2" />
                                    ) : null}
                                    <span>{isLoading ? "Cerrando sesión..." : "Sí, cerrar sesión"}</span>
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full cursor-pointer flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
