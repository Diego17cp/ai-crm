import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	FiX,
	FiFileText,
	FiInfo,
	FiAlertTriangle,
	FiUser,
} from "react-icons/fi";
import { VscRobot } from "react-icons/vsc";
import { useQuotes } from "../hooks/useQuotes";
import { formatQuoteDate } from "../utils/quoteFormatters";
import { AttachmentCard } from "@/features/chat/components/AttachmentCard";

interface QuoteDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	quoteId: number | null;
}

const ESTADO_CONFIG: Record<string, { label: string; colorClass: string }> = {
	BORRADOR: {
		label: "Borrador",
		colorClass:
			"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50",
	},
	EMITIDA: {
		label: "Emitida",
		colorClass:
			"bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/50",
	},
	ACEPTADA: {
		label: "Aceptada",
		colorClass:
			"bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50",
	},
	RECHAZADA: {
		label: "Rechazada",
		colorClass:
			"bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50",
	},
	VENCIDA: {
		label: "Vencida",
		colorClass:
			"bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
	},
};

export const QuoteDetailModal = ({
	isOpen,
	onClose,
	quoteId,
}: QuoteDetailModalProps) => {
	const { useQuoteByIdQuery } = useQuotes();
	const {
		data: response,
		isLoading,
		isError,
	} = useQuoteByIdQuery(quoteId || 0);
	const quote = response?.data;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
						onClick={onClose}
					/>
					<div className="fixed inset-0 z-115 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
							}}
							className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
								{isLoading ? (
									<div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
								) : quote ? (
									<div className="flex flex-col">
										<h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
											{quote.codigo}
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ESTADO_CONFIG[quote.estado].colorClass}`}
											>
												{
													ESTADO_CONFIG[quote.estado]
														.label
												}
											</span>
											{quote.generado_por === "BOT" && (
												<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
													<VscRobot size={11} /> Bot
												</span>
											)}
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{quote.cliente}
										</p>
									</div>
								) : (
									<h2 className="text-lg font-bold">
										Detalle de Cotización
									</h2>
								)}
								<button
									onClick={onClose}
									className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors"
								>
									<FiX size={20} />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] dark:bg-[#0f172a]/50 main-scrollbar flex flex-col gap-4">
								{isLoading ? (
									<div className="space-y-3">
										{[...Array(4)].map((_, i) => (
											<div
												key={i}
												className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
											/>
										))}
									</div>
								) : isError ? (
									<div className="flex-1 flex flex-col justify-center items-center text-center opacity-70">
										<FiInfo
											size={40}
											className="mb-3 text-red-500"
										/>
										<p className="text-gray-600 dark:text-gray-300">
											Error al cargar la cotización.
										</p>
									</div>
								) : quote ? (
									<>
										{quote.requiere_revision &&
											quote.motivo_revision && (
												<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-3">
													<FiAlertTriangle
														className="text-amber-500 shrink-0 mt-0.5"
														size={18}
													/>
													<div>
														<p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
															Motivo de revisión
														</p>
														<p className="text-sm text-amber-700 dark:text-amber-400">
															{
																quote.motivo_revision
															}
														</p>
													</div>
												</div>
											)}

										<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
											<div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
												<FiFileText /> Detalle de la
												cotización
											</div>
											<dl className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<dt className="text-gray-400">
														Proyecto
													</dt>
													<dd className="font-medium text-gray-800 dark:text-gray-200">
														{quote.proyecto}
													</dd>
												</div>
												<div>
													<dt className="text-gray-400">
														Lote
													</dt>
													<dd className="font-medium text-gray-800 dark:text-gray-200">
														{quote.lote} ·{" "}
														{quote.area_m2} m²
													</dd>
												</div>
												<div>
													<dt className="text-gray-400">
														Precio de lista
													</dt>
													<dd className="font-medium text-gray-800 dark:text-gray-200">
														S/{" "}
														{quote.precio_lista.toFixed(
															2,
														)}
													</dd>
												</div>
												<div>
													<dt className="text-gray-400">
														Descuento aplicado
													</dt>
													<dd className="font-medium text-gray-800 dark:text-gray-200">
														{quote.descuento}%
													</dd>
												</div>
												<div>
													<dt className="text-gray-400">
														Precio final
													</dt>
													<dd className="font-bold text-pink-600 dark:text-pink-400">
														S/{" "}
														{quote.precio_final.toFixed(
															2,
														)}
													</dd>
												</div>
												{quote.numero_cuotas && (
													<>
														<div>
															<dt className="text-gray-400">
																Cuota inicial
															</dt>
															<dd className="font-medium text-gray-800 dark:text-gray-200">
																S/{" "}
																{quote.cuota_inicial?.toFixed(
																	2,
																)}
															</dd>
														</div>
														<div>
															<dt className="text-gray-400">
																Plazo
															</dt>
															<dd className="font-medium text-gray-800 dark:text-gray-200">
																{
																	quote.numero_cuotas
																}{" "}
																meses
															</dd>
														</div>
														<div>
															<dt className="text-gray-400">
																Cuota mensual
															</dt>
															<dd className="font-medium text-gray-800 dark:text-gray-200">
																S/{" "}
																{quote.monto_cuota?.toFixed(
																	2,
																)}
															</dd>
														</div>
													</>
												)}
											</dl>
										</div>

										{(quote.asesor || quote.revisor) && (
											<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
												<div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
													<FiUser /> Responsable
												</div>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													{quote.revisor
														? `${quote.revisor.nombres} ${quote.revisor.apellidos ?? ""} (revisó y ${quote.estado === "RECHAZADA" ? "rechazó" : "aprobó"} la cotización)`
														: `${quote.asesor?.nombres} ${quote.asesor?.apellidos ?? ""} (generó la cotización)`}
												</p>
											</div>
										)}

										{quote.pdf_url && (
											<div className="w-full flex flex-col justify-start items-start">
												<div className="w-full max-w-none!">
													<AttachmentCard
														attachment={{
															type: "document",
															title: `Cotización ${quote.codigo}`,
															url: quote.pdf_url,
															filename: `Cotizacion_${quote.codigo}.pdf`,
															available_preview: true,
														}}
													/>
												</div>
											</div>
										)}

										<p className="text-xs text-gray-400 text-center mt-1">
											Generada el{" "}
											{formatQuoteDate(quote.created_at)}
										</p>
									</>
								) : null}
							</div>

							<div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0 flex justify-end">
								<button
									onClick={onClose}
									className="cursor-pointer px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
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
