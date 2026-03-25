import { useParams, useNavigate, Link } from "react-router";
import { useSales } from "../hooks/useSales";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "motion/react";
import { SaleDetailSkeleton } from "../components/details/SaleDetailSkeleton";
import { SaleDetailHeader } from "../components/details/SaleDetailHeader";
import { SaleGeneralInfo } from "../components/details/SaleGeneralInfo";
import { SaleFinancialInfo } from "../components/details/SaleFinancialInfo";
import { SalePaymentSchedule } from "../components/details/SalePaymentSchedule";

export const SaleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const saleId = Number(id);

    const { useQueryById } = useSales();
    const { data: response, isLoading, isError, refetch, isRefetching } = useQueryById(saleId);

    if (isLoading) return <SaleDetailSkeleton />;

    if (isError || !response?.data) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800"
            >
                <p className="text-gray-500 mb-4">Ocurrió un error al cargar la venta o no existe.</p>
                <button 
                    onClick={() => navigate("/admin/sales/contracts")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiArrowLeft /> Volver a contratos
                </button>
            </motion.div>
        );
    }

    const sale = response.data;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-7xl mx-auto pb-12"
        >
            <motion.div 
                variants={itemVariants}
            >
                <Link 
                    to="/admin/sales/contracts"
                    className="flex items-center cursor-pointer gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors w-fit"
                >
                    <FiArrowLeft /> Volver al listado
                </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SaleDetailHeader sale={sale} onRefetch={refetch} isRefetching={isRefetching} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants}>
                        <SaleGeneralInfo sale={sale} />
                    </motion.div>
                    
                    {sale.tipo_pago === "CREDITO" && (
                        <motion.div variants={itemVariants}>
                            <SalePaymentSchedule sale={sale} />
                        </motion.div>
                    )}
                </div>
                
                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <SaleFinancialInfo sale={sale} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
