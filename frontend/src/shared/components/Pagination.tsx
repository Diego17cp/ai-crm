import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2";
import { FiLoader } from "react-icons/fi";

export interface PaginationProps {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    isLoading?: boolean;
}

const PaginationButton = ({
    onClick, disabled, active = false, children, title
}: {
    onClick: () => void; disabled: boolean; active?: boolean; children: React.ReactNode; title?: string;
}) => (
    <motion.button
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
            relative h-8 min-w-8 px-2 rounded-lg text-sm font-medium
            transition-colors duration-200 flex items-center justify-center
            ${active
                ? "bg-teal-600 text-white shadow-md shadow-teal-500/20 cursor-auto"
                : disabled
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            }
        `}
    >
        {children}
    </motion.button>
);

export const Pagination = ({
    currentPage, perPage, total, totalPages, hasNext, hasPrev, onPageChange, isLoading = false
}: PaginationProps) => {

    const rangeStart = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const rangeEnd = Math.min(currentPage * perPage, total);

    const getVisiblePages = useCallback((): (number | "...")[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "...")[] = [1];
        if (currentPage <= 4)  pages.push(2, 3, 4, 5, "...", totalPages);
        else if (currentPage >= totalPages - 3) pages.push("...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        else pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        return pages;
    }, [currentPage, totalPages]);

    if (totalPages <= 1 && total <= perPage) return null;

    return (
        <motion.div
            className="flex justify-between items-center w-full px-2 py-4 mt-2 border-t border-gray-100 dark:border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{rangeStart}</span> a <span className="font-semibold text-gray-900 dark:text-gray-100">{rangeEnd}</span> de <span className="font-semibold text-gray-900 dark:text-gray-100">{total}</span>
            </div>

            <div className={`flex items-center gap-1.5 ${isLoading ? "opacity-60 pointer-events-none" : "transition-opacity"}`}>
                <PaginationButton onClick={() => onPageChange(1)} disabled={!hasPrev || isLoading} title="Primera">
                    <HiChevronDoubleLeft className="w-4 h-4" />
                </PaginationButton>

                <PaginationButton onClick={() => onPageChange(currentPage - 1)} disabled={!hasPrev || isLoading} title="Anterior">
                    <HiChevronLeft className="w-4 h-4" />
                </PaginationButton>
                
                <div className="hidden sm:flex items-center gap-1 mx-2">
                    {getVisiblePages().map((page, index) =>
                        page === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">•••</span>
                        ) : (
                            <PaginationButton key={page} active={page === currentPage} onClick={() => onPageChange(page as number)} disabled={isLoading}>
                                {page}
                            </PaginationButton>
                        )
                    )}
                </div>

                <PaginationButton onClick={() => onPageChange(currentPage + 1)} disabled={!hasNext || isLoading} title="Siguiente">
                    <HiChevronRight className="w-4 h-4" />
                </PaginationButton>
                <PaginationButton onClick={() => onPageChange(totalPages)} disabled={!hasNext || isLoading} title="Última">
                    <HiChevronDoubleRight className="w-4 h-4" />
                </PaginationButton>
                
                <AnimatePresence>
                    {isLoading && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="ml-2">
                            <FiLoader className="w-4 h-4 text-teal-500 animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};