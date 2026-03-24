import { motion } from "motion/react";
import type { Venta } from "../types";
import { FiCalendar, FiChevronRight, FiFileText, FiUser } from "react-icons/fi";
import { formatCurrency, getEstadoVentaColor, getTipoPagoColor } from "../utils/salesFormatters";
import { Link } from "react-router";

interface Props {
    venta: Venta;
}

export const SaleListItem = ({ venta }: Props) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
		>
            <Link
                to={`/sales/contract/${venta.id}`}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800/50 transition-all gap-4 sm:gap-6 cursor-pointer"
            >         
                <div className="flex items-center gap-4 w-full md:w-3/12 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                        <FiUser size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {venta.cliente.nombres} {venta.cliente.apellidos}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Doc: {venta.cliente.numero}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                            <FiCalendar size={10} />
                            {new Date(venta.fecha_venta).toLocaleDateString("es-PE")}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col w-full md:w-3/12 border-l-2 md:border-l-0 pl-3 md:pl-0 border-teal-500 md:border-transparent min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                        {venta.lote.manzana.etapa.proyecto.nombre}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        Mz. {venta.lote.manzana.codigo} - Lote{" "}
                        {venta.lote.numero_lote}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Área: {venta.lote.area_m2} m²
                    </p>
                </div>
                <div className="flex flex-col w-full md:w-2/12 shrink-0">
                    <p className="text-lg font-bold text-teal-700 dark:text-teal-400 leading-tight">
                        {formatCurrency(venta.monto_total)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wide ${getTipoPagoColor(venta.tipo_pago)}`}
                        >
                            {venta.tipo_pago}
                        </span>
                        {venta.tipo_pago === "CREDITO" && venta.num_cuotas && (
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                {venta.num_cuotas} Cuotas
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto md:flex-1 gap-4">
                    <div className="flex flex-col gap-2">
                        <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-lg border w-max ${getEstadoVentaColor(venta.estado)}`}
                        >
                            {venta.estado}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-max border border-gray-100 dark:border-gray-700">
                            <FiFileText size={12} className="text-teal-500" />
                            {venta.estado_contrato}
                        </div>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-teal-600 group-hover:bg-teal-50 dark:group-hover:text-teal-400 dark:group-hover:bg-teal-900/30 transition-colors shrink-0">
                        <FiChevronRight size={20} />
                    </div>
                </div>
            </Link>
		</motion.div>
	);
};
