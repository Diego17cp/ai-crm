import { FiRefreshCw } from "react-icons/fi";
import type { VentaById } from "../../types";
import { 
    getEstadoContratoColor, 
    getEstadoVentaColor, 
    getTipoPagoColor, 
    formatDate 
} from "../../utils/salesFormatters";

interface Props {
    sale: VentaById;
    onRefetch: () => void;
    isRefetching: boolean;
}

export const SaleDetailHeader = ({ sale, onRefetch, isRefetching }: Props) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Contrato {sale.lote.manzana.etapa.proyecto.abreviatura}-{sale.lote.manzana.codigo}-{sale.lote.numero_lote}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${getEstadoVentaColor(sale.estado)}`}>
                        {sale.estado}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${getTipoPagoColor(sale.tipo_pago)}`}>
                        {sale.tipo_pago}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${getEstadoContratoColor(sale.estado_contrato)}`}>
                        {sale.estado_contrato}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Venta</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(sale.fecha_venta)}
                    </p>
                </div>
                <button
                    onClick={onRefetch}
                    disabled={isRefetching}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <FiRefreshCw className={isRefetching ? "animate-spin" : ""} />
                    Refrescar
                </button>
            </div>
        </div>
    );
};