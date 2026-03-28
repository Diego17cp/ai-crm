import { motion } from "motion/react";
import { FiPieChart } from "react-icons/fi";

export const AppLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center space-y-6"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="p-4 bg-linear-to-r from-teal-500 to-emerald-500 rounded-full shadow-lg"
                    >
                        <FiPieChart size={32} className="text-white" />
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-teal-400 rounded-full opacity-50"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {/* TODO: Cambiar por el nombre de la aplicación */}
                        Cargando AI-CRM
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Preparando tu experiencia...
                    </p>
                </motion.div>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                    className="w-32 h-1 bg-linear-to-r from-teal-500 to-emerald-500 rounded-full"
                />
            </motion.div>
        </div>
    );
};