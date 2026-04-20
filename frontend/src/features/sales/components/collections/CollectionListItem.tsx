import { motion } from "motion/react";
import { FiUser, FiPhone, FiCalendar, FiAlertCircle, FiArrowRight, FiMail, FiRefreshCw } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router";
import type { Cobro } from "../../types";
import { formatCurrency, formatDate } from "../../utils/salesFormatters";

interface Props {
    cobro: Cobro;
    onPayClick: (cuotaId: number, saleId: number) => void;
    onRemindClick: (cuotaId: number) => void;
    isReminding: boolean;
}

export const CollectionListItem = ({ cobro, onPayClick, onRemindClick, isReminding }: Props) => {
    const isOverdue = (cobro.dias_mora ?? 0) > 0;

    const d = new Date(cobro.fecha_vencimiento);
    const utcVencimiento = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const today = new Date();
    const localHoy = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffDays = Math.floor((utcVencimiento - localHoy) / (1000 * 60 * 60 * 24));
    
    const isToday = !isOverdue && diffDays === 0;
    const isFuture = !isOverdue && diffDays > 0;

    const email = cobro.venta.cliente.email;
    const telefonos = cobro.venta.cliente.telefonos || [];
    
    const wpPhone = telefonos.find(t => t.tipo?.toUpperCase() === "WHATSAPP");
    const callPhone = telefonos.find(t => t.tipo?.toUpperCase() === "PERSONAL" || t.tipo?.toUpperCase() === "TRABAJO");

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group p-5 bg-white dark:bg-gray-900 border-l-4 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                isOverdue 
                    ? "border-l-red-500 border border-gray-100 dark:border-gray-800 dark:border-l-red-800/50" 
                    : isToday 
                        ? "border-l-amber-500 border border-gray-100 dark:border-gray-800 dark:border-l-amber-800/50"
                        : "border-l-blue-500 border border-gray-100 dark:border-gray-800 dark:border-l-blue-800/50"
            }`}
        >
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">                
                <div className="flex flex-col min-w-62.5">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <FiUser className="text-gray-400" />
                        {cobro.venta.cliente.nombres} {cobro.venta.cliente.apellidos}
                    </div>                    
                    <div className="flex items-center gap-2 mb-1">
                        {wpPhone && (
                            <button 
                                type="button"
                                onClick={() => onRemindClick(cobro.id)}
                                disabled={isReminding}
                                className="flex items-center gap-1.5 px-3 py-1 bg-[#25D366]/10 cursor-pointer text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/20 rounded-lg text-xs font-bold transition-colors w-fit border border-[#25D366]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isReminding ? (
                                    <FiRefreshCw className="animate-spin" size={14} />
                                ) : (
                                    <FaWhatsapp size={14} />
                                )}
                                {isReminding ? "Enviando..." : "Notificar"}
                            </button>
                        )}
                        {callPhone && (
                            <a
                                href={`tel:${callPhone.numero}`}
                                className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-800"
                                title="Llamar"
                            >
                                <FiPhone size={14} />
                            </a>
                        )}
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className="p-1.5 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                                title="Enviar Correo"
                            >
                                <FiMail size={14} />
                            </a>
                        )}
                        {!wpPhone && !callPhone && !email && (
                            <span className="text-xs text-gray-400 italic">Sin datos de contacto</span>
                        )}
                    </div>
                    {cobro.numero_de_notificaciones > 0 && (
                        <span className="inline-flex mt-1 items-center gap-1 px-2.5 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50 w-fit">
                            <FiAlertCircle size={14} />
                            {cobro.numero_de_notificaciones} notificaci{cobro.numero_de_notificaciones > 1 ? "ones" : "ón"} enviada{cobro.numero_de_notificaciones > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <div className="flex flex-col min-w-50 border-l-2 xl:border-l-0 pl-3 xl:pl-0 border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {cobro.venta.lote.manzana.etapa.proyecto.nombre}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Mz. {cobro.venta.lote.manzana.codigo} Lote {cobro.venta.lote.numero_lote}
                    </span>
                    <Link 
                        to={`/admin/sales/contract/${cobro.id_venta}`}
                        className="text-xs font-medium flex items-center gap-1 mt-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-fit"
                    >
                        Ver Contrato <FiArrowRight size={12} />
                    </Link>
                </div>
                <div className="flex flex-col items-start xl:items-center min-w-37.5">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">Cuota N° {cobro.numero_cuota}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {formatCurrency(cobro.monto_cuota)}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm">
                        <FiCalendar className="text-gray-400" size={14} />
                        <span className={isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"}>
                            {formatDate(cobro.fecha_vencimiento)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-row xl:flex-col items-center justify-between w-full xl:w-auto gap-4 xl:gap-3">
                    <div className="flex flex-col items-end">
                        {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50">
                                <FiAlertCircle size={14} />
                                {cobro.dias_mora} días de mora
                            </span>
                        )}
                        {isToday && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
                                Vence Hoy
                            </span>
                        )}
                        {isFuture && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50">
                                Dentro de {diffDays} días
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => onPayClick(cobro.id, cobro.id_venta)}
                        className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-teal-700 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-lg transition-colors shadow-sm"
                    >
                        Registrar Pago
                    </button>
                </div>
                
            </div>
        </motion.div>
    );
};