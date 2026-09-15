import { FiInbox, FiCheckCircle, FiXCircle, FiFileText, FiAlertTriangle, FiMessageCircle, FiX } from "react-icons/fi";
import { useQuoteReview } from "../../hooks/useQuoteReview";
import { ErrorState } from "@/shared/components";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Props {
	quoteId: number | null;
	onTakeReview: (quoteId: number) => void;
	onApprove: (quoteId: number) => void;
	onReject: (quoteId: number, motivo: string) => void;
	onChat: (chatId: string) => void;
	onClose: () => void;
}

export const QuoteReviewPanel = ({ quoteId, onTakeReview, onApprove, onReject, onChat, onClose }: Props) => {
	const { useQuoteByIdQuery } = useQuoteReview();
	const { data, isLoading, isError, error, refetch } = useQuoteByIdQuery(quoteId);
	const quote = data?.data;
	const [motivo, setMotivo] = useState("");
	const [showRejectForm, setShowRejectForm] = useState(false);

	if (!quoteId) {
		return (
			<div className="flex-1 h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 text-gray-400">
				<FiInbox size={48} className="mb-4 opacity-50" />
				<p>Selecciona una cotización del panel izquierdo para revisarla.</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex-1 h-full flex flex-col bg-gray-100 dark:bg-gray-950 p-6 space-y-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-2/3 animate-pulse" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex-1 h-full flex items-center justify-center bg-gray-100 dark:bg-gray-950">
				<ErrorState title="Error al cargar la cotización" error={error} onRetry={refetch} />
			</div>
		);
	}

	const resolved = quote?.estado !== "BORRADOR";
	const claimed = Boolean(quote?.id_revisor);

	return (
		<div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-950">
			<div className="h-20 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between shrink-0">
				<div>
					<h3 className="font-bold text-gray-900 dark:text-white">{quote?.codigo}</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">{quote?.cliente}</p>
				</div>
				{resolved && (
					<button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Cerrar">
						<FiX size={18} />
					</button>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-6 space-y-4 main-scrollbar">
				{resolved && (
					<div
						className={`rounded-xl p-4 flex gap-3 ${
							quote?.estado === "EMITIDA"
								? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50"
								: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"
						}`}
					>
						{quote?.estado === "EMITIDA" ? <FiCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={18} /> : <FiXCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
						<div>
							<p className={`text-sm font-semibold ${quote?.estado === "EMITIDA" ? "text-teal-800 dark:text-teal-300" : "text-red-800 dark:text-red-300"}`}>
								{quote?.estado === "EMITIDA" ? "Cotización aprobada" : "Cotización rechazada"}
							</p>
						</div>
					</div>
				)}

				<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-3">
					<FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
					<div>
						<p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Motivo de revisión</p>
						<p className="text-sm text-amber-700 dark:text-amber-400">{quote?.motivo_revision}</p>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
					<div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
						<FiFileText /> Detalle de la cotización
					</div>
					<dl className="grid grid-cols-2 gap-3 text-sm">
						<div><dt className="text-gray-400">Proyecto</dt><dd className="font-medium text-gray-800 dark:text-gray-200">{quote?.proyecto}</dd></div>
						<div><dt className="text-gray-400">Lote</dt><dd className="font-medium text-gray-800 dark:text-gray-200">{quote?.lote}</dd></div>
						<div><dt className="text-gray-400">Precio de lista</dt><dd className="font-medium text-gray-800 dark:text-gray-200">S/ {Number(quote?.precio_lista).toFixed(2)}</dd></div>
						<div><dt className="text-gray-400">Descuento aplicado</dt><dd className="font-medium text-gray-800 dark:text-gray-200">{Number(quote?.descuento)}%</dd></div>
						<div><dt className="text-gray-400">Precio final</dt><dd className="font-bold text-teal-600 dark:text-teal-400">S/ {Number(quote?.precio_final).toFixed(2)}</dd></div>
						{quote?.numero_cuotas && (
							<>
								<div><dt className="text-gray-400">Cuota inicial</dt><dd className="font-medium text-gray-800 dark:text-gray-200">S/ {Number(quote?.cuota_inicial).toFixed(2)}</dd></div>
								<div><dt className="text-gray-400">Plazo</dt><dd className="font-medium text-gray-800 dark:text-gray-200">{quote?.numero_cuotas} meses</dd></div>
								<div><dt className="text-gray-400">Cuota mensual</dt><dd className="font-medium text-gray-800 dark:text-gray-200">S/ {Number(quote?.monto_cuota).toFixed(2)}</dd></div>
							</>
						)}
					</dl>
				</div>
			</div>

			<div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0 flex flex-col gap-2">
				{quote?.id_conversacion && (
					<button
						onClick={() => onChat(quote.id_conversacion!)}
						className="w-full flex cursor-pointer items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
					>
						<FiMessageCircle size={16} /> Conversar con el cliente
					</button>
				)}

				<AnimatePresence mode="wait">
					{resolved ? (
						<motion.div key="resolved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
							<button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
								Cerrar
							</button>
						</motion.div>
					) : !claimed ? (
						<motion.div key="queue-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
							<button
								className="w-full cursor-pointer py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-500/30 transition-all"
								onClick={() => onTakeReview(quoteId)}
							>
								Tomar esta revisión
							</button>
						</motion.div>
					) : showRejectForm ? (
						<motion.div key="reject-form" initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
							<div className="space-y-2 py-1">
								<textarea
									value={motivo}
									onChange={(e) => setMotivo(e.target.value)}
									placeholder="Motivo del rechazo (opcional)..."
									rows={2}
									className="w-full bg-gray-50 dark:bg-gray-800 border focus:border-red-400 dark:focus:border-red-400 transition-all duration-200 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm outline-none resize-none"
								/>
								<div className="flex gap-2">
									<button onClick={() => setShowRejectForm(false)} className="flex-1 cursor-pointer transition-all duration-200 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-950 text-sm font-medium">
										Cancelar
									</button>
									<button onClick={() => onReject(quoteId, motivo)} className="flex-1 cursor-pointer transition-all duration-200 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
										Confirmar rechazo
									</button>
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div key="action-buttons" initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="flex gap-2 overflow-hidden">
							<button onClick={() => setShowRejectForm(true)} className="flex-1 cursor-pointer transition-all duration-200 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20">
								<FiXCircle /> Rechazar
							</button>
							<button onClick={() => onApprove(quoteId)} className="flex-1 cursor-pointer transition-all duration-200 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-500/30">
								<FiCheckCircle /> Aprobar y enviar
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};