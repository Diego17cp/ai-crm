import { FiUser, FiMapPin, FiMail } from "react-icons/fi";
import type { VentaById } from "../../types";

export const SaleGeneralInfo = ({ sale }: { sale: VentaById }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Datos del Cliente
                    </h3>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <FiUser size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {sale.cliente.nombres} {sale.cliente.apellidos}
                            </p>
                            <p className="text-sm text-gray-500">Doc: {sale.cliente.numero}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg">
                            <FiMail size={20} />
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">{sale.cliente.email || "Sin correo"}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>Nacionalidad: {sale.cliente.nacionalidad || (sale.cliente.es_peruano ? "Peruana" : "Extranjera")}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Datos del Lote
                    </h3>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <FiMapPin size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                Proyecto: {sale.lote.manzana.etapa.proyecto.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                                {sale.lote.manzana.etapa.nombre} • Mz {sale.lote.manzana.codigo} • Lote {sale.lote.numero_lote}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Área (m²)</p>
                            <p className="font-medium text-gray-900 dark:text-white">{sale.lote.area_m2} m²</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Partida Electrónica</p>
                            <p className="font-medium text-gray-900 dark:text-white">{sale.lote.numero_partida || "No asignada"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};