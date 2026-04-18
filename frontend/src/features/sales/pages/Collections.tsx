import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiDollarSign, FiClock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { Pagination } from "@/shared/components/Pagination";
import {
    useCollections,
    type CollectionFilterTab,
} from "../hooks/useCollections";
import { CollectionSkeleton } from "../components/collections/CollectionSkeleton";
import { CollectionListItem } from "../components/collections/CollectionListItem";
import { PayQuotaModal } from "../components/details/PayQuotaModal";
import type { IconType } from "react-icons";

export const Collections = () => {
    const {
        cobros,
        meta,
        isLoading,
        isError,
        page,
        goToPage,
        currentTab,
        handleTabChange,
        refetch,
        isRefetching,
        notifyReminderMutation
    } = useCollections();

    const [selectedPayment, setSelectedPayment] = useState<{
        cuotaId: number;
        saleId: number;
    } | null>(null);

    const tabs: { id: CollectionFilterTab; label: string; icon: IconType }[] = [
        { id: "vencidas", label: "Vencidas y Mora", icon: FiClock },
        { id: "proximas", label: "Próximas a Vencer", icon: FiDollarSign },
        { id: "todas", label: "Todas las Pendientes", icon: FiCheckCircle },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiDollarSign className="text-teal-600 dark:text-teal-500" />
                        Control de Cobranzas
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monitorea y gestiona las cuotas pendientes de todos los contratos.
                    </p>
                </motion.div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        title="Recargar datos"
                        className="p-3 cursor-pointer flex gap-2 items-center shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50"
                    >
                        <FiRefreshCw
                            className={isRefetching ? "animate-spin" : ""}
                            size={18}
                        />
                        Recargar
                    </button>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit"
            >
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`relative cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                                isActive
                                    ? "text-teal-700 dark:text-teal-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBadge"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-lg"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon size={16} />
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </motion.div>
            <div className="w-full flex-1">
                {isError ? (
                    <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl border border-red-100 dark:border-red-900/30">
                        Ocurrió un error al cargar las cobranzas.
                    </div>
                ) : isLoading ? (
                    <CollectionSkeleton />
                ) : cobros.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <FiCheckCircle size={28} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Todo al día
                        </h3>
                        <p className="text-gray-500 mt-1 max-w-md">
                            No hay cuotas {currentTab === "vencidas" ? "vencidas" : "pendientes por mostrar en este filtro"}. ¡Buen trabajo!
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-3"
                    >
                        <AnimatePresence mode="popLayout">
                            {cobros.map((cobro) => (
                                <CollectionListItem
                                    key={cobro.id}
                                    cobro={cobro}
                                    onPayClick={(cuotaId, saleId) =>
                                        setSelectedPayment({ cuotaId, saleId })
                                    }
                                    onRemindClick={(cuotaId) => notifyReminderMutation.mutate(cuotaId)}
                                    isReminding={notifyReminderMutation.isPending && notifyReminderMutation.variables === cobro.id}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
            {!isLoading && cobros.length > 0 && meta && meta.totalPages > 1 && (
                <div className="mt-auto flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={meta.totalPages}
                        onPageChange={goToPage}
                        perPage={meta.limit}
                        total={meta.total}
                        hasNext={meta.hasNextPage}
                        hasPrev={meta.hasPreviousPage}
                    />
                </div>
            )}
            {selectedPayment && (
                <PayQuotaModal
                    isOpen={!!selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    cuotaId={selectedPayment.cuotaId}
                    saleId={selectedPayment.saleId}
                />
            )}
        </div>
    );
};

export default Collections;
