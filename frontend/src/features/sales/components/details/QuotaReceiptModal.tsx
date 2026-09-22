import { AnimatePresence, motion } from "motion/react";
import type { Cuota } from "../../types";
import {
	FiX,
	FiCalendar,
	FiCreditCard,
	FiExternalLink,
	FiImage,
	FiFileText,
} from "react-icons/fi";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	cuota: Cuota;
}

export const QuotaReceiptModal = ({ isOpen, onClose, cuota }: Props) => {
	const formatCurrency = (amount: string) => {
		const num = parseFloat(amount) || 0;
		return new Intl.NumberFormat("es-PE", {
			style: "currency",
			currency: "PEN",
		}).format(num);
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return "Pendiente";
		return new Date(dateStr).toLocaleDateString("es-PE", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs"
						onClick={onClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 16 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 16 }}
						className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md max-h-[85vh] flex flex-col relative z-10 overflow-hidden"
					>
						<div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
							<div>
								<h3 className="text-base font-bold text-gray-900 dark:text-white">
									Recibo de Cuota #{cuota.numero_cuota}
								</h3>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									ID de registro: #{cuota.id}
								</p>
							</div>
							<button
								onClick={onClose}
								className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
							>
								<FiX size={18} />
							</button>
						</div>
						<div className="flex-1 overflow-y-auto p-6 space-y-6 main-scrollbar">
							<div className="bg-linear-to-b from-gray-50 to-gray-50/30 dark:from-gray-800/40 dark:to-transparent border border-gray-100 dark:border-gray-800/60 rounded-xl p-5 text-center relative overflow-hidden">
								<div className="absolute top-0 left-0 right-0 h-1 bg-pink-500" />
								<span className="text-xs font-semibold tracking-wider text-pink-600 dark:text-pink-400 uppercase bg-pink-50 dark:bg-pink-500/10 px-2.5 py-1 rounded-md">
									{cuota.estado}
								</span>
								<h4 className="text-3xl font-black text-gray-900 dark:text-white mt-3 tracking-tight">
									{formatCurrency(cuota.monto_cuota)}
								</h4>
								<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
									Monto total procesado
								</p>
							</div>
							<div className="space-y-3.5">
								<h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
									Detalles de Transacción
								</h5>
								<div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3 text-sm">
									<div className="flex justify-between items-center">
										<span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
											<FiCreditCard className="text-gray-400" />{" "}
											Método de pago
										</span>
										<span className="font-semibold text-gray-800 dark:text-gray-200 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-sm">
											{cuota.metodo_pago}
										</span>
									</div>
									<div className="flex justify-between items-center border-t border-dashed border-gray-100 dark:border-gray-800 pt-3">
										<span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
											<FiCalendar className="text-gray-400" />{" "}
											Fecha de Pago
										</span>
										<span className="font-medium text-gray-900 dark:text-white">
											{formatDate(cuota.fecha_pago)}
										</span>
									</div>
									<div className="flex justify-between items-center border-t border-dashed border-gray-100 dark:border-gray-800 pt-3">
										<span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
											<FiCalendar className="text-gray-400" />{" "}
											Vencimiento original
										</span>
										<span className="font-medium text-gray-600 dark:text-gray-400">
											{formatDate(
												cuota.fecha_vencimiento,
											)}
										</span>
									</div>
								</div>
							</div>
							<div className="space-y-3">
								<h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
									Documento de Respaldo
								</h5>

								{cuota.comprobante_url ? (
									<div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/20 group">
										<div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
											<img
												src={cuota.comprobante_url}
												alt={`Comprobante cuota ${cuota.numero_cuota}`}
												className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
												onError={(e) => {
													e.currentTarget.style.display =
														"none";
													if (
														e.currentTarget
															.nextElementSibling
													) {
														(
															e.currentTarget
																.nextElementSibling as HTMLElement
														).style.display =
															"flex";
													}
												}}
											/>
											<div className="hidden absolute inset-0 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
												<FiFileText size={36} />
												<span className="text-xs">
													Documento adjunto
												</span>
											</div>
										</div>
										<div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
											<span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate pr-4">
												<FiImage className="shrink-0 text-pink-500" />{" "}
												archivo_comprobante
											</span>
											<a
												href={cuota.comprobante_url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center gap-1 shrink-0"
											>
												Ver original{" "}
												<FiExternalLink size={12} />
											</a>
										</div>
									</div>
								) : (
									<div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-gray-400 dark:text-gray-500">
										<FiImage
											size={24}
											className="mx-auto mb-2 text-gray-300 dark:text-gray-700"
										/>
										<p className="text-xs">
											No se ha cargado una imagen o
											archivo de comprobante para esta
											cuota.
										</p>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};
