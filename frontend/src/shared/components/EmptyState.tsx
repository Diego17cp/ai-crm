import { motion } from "motion/react";
import { FiInbox } from "react-icons/fi";
import { itemVariants } from "../utils/animation";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export const EmptyState = ({
    title = "No se encontró lo que buscas",
    description = "Parece que no hay resultados que coincidan con tu búsqueda. Intenta ajustar los filtros o verifica la información ingresada.",
    icon = <FiInbox className="w-10 h-10 text-gray-400" />
}: EmptyStateProps) => {
    return (
        <motion.div 
            className="relative bg-linear-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700/40 rounded-2xl flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {description}
            </p>
        </motion.div>
    );
};