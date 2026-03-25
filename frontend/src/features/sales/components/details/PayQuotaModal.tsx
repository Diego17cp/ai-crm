import { useState } from "react";
import { type MetodoPago } from "../../types";
import { useSales } from "../../hooks/useSales";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cuotaId: number;
    saleId: number;
}

export const PayQuotaModal = ({ isOpen, onClose, cuotaId }: Props) => {
    const { usePayQuotaMutation } = useSales();
    const [metodoPago, setMetodoPago] = useState<MetodoPago>("TRANSFERENCIA");
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const mutation = usePayQuotaMutation(cuotaId, metodoPago);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setFilePreview(objectUrl);
        }
    };

    const confirmPayment = () => {
        mutation.mutate(undefined, {
            onSuccess: () => {
                onClose();
                setFilePreview(null);
            }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm shadow-xl"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Registrar Pago de Cuota
                            </h2>
                            <button onClick={onClose} className="text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Método de Pago
                                </label>
                                <select 
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                                >
                                    <option value="TRANSFERENCIA">Transferencia / Yape</option>
                                    <option value="DEPOSITO">Depósito Bancario</option>
                                    <option value="EFECTIVO">Efectivo en Caja</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Comprobante (Opcional por ahora)
                                </label>
                                {!filePreview ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiUploadCloud className="mb-2 text-gray-400" size={24} />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Clic para subir imagen</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={filePreview} alt="Comprobante" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => setFilePreview(null)}
                                            className="absolute top-2 cursor-pointer right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmPayment}
                                disabled={mutation.isPending}
                                className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {mutation.isPending && <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4" />}
                                Confirmar Pago
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};