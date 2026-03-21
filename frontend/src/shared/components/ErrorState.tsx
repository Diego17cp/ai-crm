import { motion } from "motion/react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { itemVariants } from "../utils/animation";
import type { ApiError } from "@/core/types";

interface ErrorStateProps {
    error?: ApiError;
    onRetry?: () => void;
    title?: string
}

export const ErrorState = ({ error, onRetry, title = "Error al cargar los datos" }: ErrorStateProps) => {
    let errorMessage = "Ocurrió un error al cargar los datos. Por favor, intenta nuevamente más tarde.";
    if (error?.response?.data?.error) errorMessage = error.response.data.error;
    else if (error?.response?.data?.message) errorMessage = error.response.data.message;
    else if (error?.message) errorMessage = error.message;

    return (
        <motion.div 
            className="relative bg-linear-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-800 rounded-3xl border border-red-200 dark:border-red-800/50 p-12 text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                <FiAlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                {errorMessage}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Reintentar
                </button>
            )}
        </motion.div>
    );
};