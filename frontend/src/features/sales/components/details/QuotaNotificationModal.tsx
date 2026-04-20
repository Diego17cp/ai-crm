import { motion, AnimatePresence } from "motion/react";
import { FiX, FiBell, FiClock, FiUser, FiCpu } from "react-icons/fi";
import type { Notificacion } from "../../types";
import { formatDateTime, getUrgencyLevelLabel, getUrgencyLevelColor } from "../../utils/salesFormatters";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    notificaciones: Notificacion[];
    cuotaNro: number;
}

export const QuotaNotificationsModal = ({ isOpen, onClose, notificaciones, cuotaNro }: Props) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden max-h-[85vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <FiBell size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificaciones</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Recordatorios de Cuota N° {cuotaNro}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto main-scrollbar flex flex-col gap-4">
                                {notificaciones.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                                            <FiBell size={24} />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sin recordatorios</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                            Aún no se han enviado notificaciones para esta cuota.
                                        </p>
                                    </div>
                                ) : (
                                    notificaciones.map((notif) => (
                                        <div key={notif.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 relative">
                                            <span className={`absolute top-4 right-4 px-2 py-0.5 text-xs font-semibold rounded-md border ${getUrgencyLevelColor(notif.nivel_urgencia)}`}>
                                                {getUrgencyLevelLabel(notif.nivel_urgencia)}
                                            </span>
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white font-medium mb-1.5 pr-24">
                                                <span>Plantilla usada: <span className="text-gray-600 dark:text-gray-300 font-normal">{notif.template}</span></span>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <FiClock size={14} />
                                                    {formatDateTime(notif.fecha_envio)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {notif.es_automatica ? (
                                                        <><FiCpu size={14} className="text-teal-500" /> Enviado por Sistema</>
                                                    ) : (
                                                        <><FiUser size={14} className="text-blue-500" /> Enviado por {notif.usuario?.nombres} {notif.usuario?.apellidos}</>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0">
                                <button
                                    onClick={onClose}
                                    className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};