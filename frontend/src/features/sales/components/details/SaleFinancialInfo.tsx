import type { VentaById } from "../../types";
import { formatCurrency } from "../../utils/salesFormatters";
import { 
    FiTrendingUp, 
    FiCheckCircle, 
    FiLayers, 
    FiCreditCard, 
    FiClock, 
    FiCalendar 
} from "react-icons/fi";

export const SaleFinancialInfo = ({ sale }: { sale: VentaById }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-linear-to-b from-gray-50/50 to-white dark:from-gray-800/20 dark:to-gray-900">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                        <FiTrendingUp size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumen Financiero</h2>
                </div>
                
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Monto Total del Contrato
                    </span>
                    <span className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 tracking-tight pb-1">
                        {formatCurrency(sale.monto_total)}
                    </span>
                </div>
            </div>
            {sale.tipo_pago === "CREDITO" && (
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center pl-3 pr-4 py-3 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-900/30">
                        <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                            <FiCheckCircle size={18} />
                            <span className="text-sm font-semibold">Cuota Inicial</span>
                        </div>
                        <span className="font-bold text-teal-900 dark:text-teal-400 text-lg">
                            {formatCurrency(sale.cuota_inicial)}
                        </span>
                    </div>
                    <div className="pt-2 space-y-4">
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                <FiLayers size={16} />
                                <span className="text-sm">Número de Cuotas</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {sale.num_cuotas} meses
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                <FiCreditCard size={16} />
                                <span className="text-sm">Monto por Cuota</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(sale.monto_cuota)}
                            </span>
                        </div>
                        {(sale.meses_gracia ?? 0) > 0 && (
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    <FiClock size={16} />
                                    <span className="text-sm">Meses de Gracia</span>
                                </div>
                                <span className="font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md text-sm">
                                    {sale.meses_gracia} meses
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                <FiCalendar size={16} />
                                <span className="text-sm">Día de Pago</span>
                            </div>
                            <span className="font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md text-sm">
                                Día {sale.dia_pago}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};