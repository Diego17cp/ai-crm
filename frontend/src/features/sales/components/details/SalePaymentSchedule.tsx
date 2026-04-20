import { useState } from "react";
import type { VentaById } from "../../types";
import { formatCurrency, formatDate, getEstadoCuotaColor } from "../../utils/salesFormatters";
import { PayQuotaModal } from "./PayQuotaModal";
import { QuotaNotificationsModal } from "./QuotaNotificationModal";
import { FiBell } from "react-icons/fi";

export const SalePaymentSchedule = ({ sale }: { sale: VentaById }) => {
    const [modalState, setModalState] = useState<{
        type: "payment" | "notifications" | null;
        cuotaId: number | null;
    }>({
        type: null,
        cuotaId: null
    });
    const handleCloseModal = () => setModalState({ type: null, cuotaId: null });

    const selectedCuota = sale.cuotas.find(c => c.id === modalState.cuotaId) || null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cronograma de Pagos</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Mostrando {sale.cuotas.length} cuotas programadas
                </p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium">N°</th>
                            <th className="px-6 py-4 font-medium">Vencimiento</th>
                            <th className="px-6 py-4 font-medium">Monto</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Fecha Pago</th>
                            <th className="px-6 py-4 font-medium text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sale.cuotas.map((cuota) => (
                            <tr key={cuota.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {cuota.numero_cuota}
                                </td>
                                <td className="px-6 py-4">
                                    {formatDate(cuota.fecha_vencimiento)}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {formatCurrency(cuota.monto_cuota)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoCuotaColor(cuota.estado)}`}>
                                        {cuota.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {cuota.fecha_pago ? formatDate(cuota.fecha_pago) : "-"}
                                </td>
                                <td className="px-6 py-4 text-right flex gap-4 justify-end items-center">
                                    <button
                                        onClick={() => setModalState({ type: "notifications", cuotaId: cuota.id })}
                                        title="Ver notificaciones"
                                        className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        <FiBell size={16} />
                                    </button>
                                    {cuota.estado === "PENDIENTE" ? (
                                        <button 
                                            onClick={() => setModalState({ type: "payment", cuotaId: cuota.id })}
                                            className="text-blue-600 cursor-pointer hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                                        >
                                            Registrar Pago
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Pagado ({cuota.metodo_pago})</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PayQuotaModal 
                isOpen={modalState.type === "payment"}
                onClose={handleCloseModal}
                cuotaId={modalState.cuotaId!}
                saleId={sale.id}
            />
            {selectedCuota && (
                <QuotaNotificationsModal
                    isOpen={modalState.type === "notifications"}
                    onClose={handleCloseModal}
                    notificaciones={selectedCuota.notificaciones}
                    cuotaNro={selectedCuota.numero_cuota}
                />
            )}
        </div>
    );
};