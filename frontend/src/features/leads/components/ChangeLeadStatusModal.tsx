import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	FiX,
	FiAlertCircle,
	FiCheckCircle,
	FiTrendingUp,
	FiXCircle,
	FiHelpCircle,
} from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import type { Lead, ManualStatus, UpdateLeadStatusPayload } from "../types";
import { useLeads } from "../hooks/useLeads";
import type { ApiError } from "@/core/types";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	lead: Lead | null;
	targetStatus: ManualStatus | null;
}

export const ChangeLeadStatusModal = ({
	isOpen,
	onClose,
	lead,
	targetStatus,
}: Props) => {
	const [motivo, setMotivo] = useState("");
	const [error, setError] = useState<string | null>(null);

	const { useUpdateLeadStatusMutation } = useLeads();

	const isPerdido = targetStatus === "PERDIDO";
	const isCalificado = targetStatus === "CALIFICADO";

	const payload = useMemo((): UpdateLeadStatusPayload => {
		return {
			newState: targetStatus!,
			motivo: isPerdido ? motivo : undefined,
		};
	}, [targetStatus, motivo, isPerdido]);
	const updateStatusMutation = useUpdateLeadStatusMutation(
		lead?.id || 0,
		payload,
	);
	const isSubmitting = updateStatusMutation.isPending;

	useEffect(() => {
		if (isOpen) {
			setError(null);
			setMotivo("");
		}
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, isSubmitting]);

	if (!lead || !targetStatus) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (isPerdido && !motivo.trim()) {
			setError("El motivo de pérdida es estrictamente obligatorio.");
			return;
		}

		try {
			updateStatusMutation.mutate(undefined, {
        onSuccess: () => {
          onClose()
        }
      })
		} catch (err) {
			const message =
				(err as ApiError)?.response?.data?.message ||
				"Error al actualizar el lead.";
			setError(message);
		}
	};

	const uiConfig = {
		CALIFICADO: {
			title: "Calificar Lead",
			icon: <FiCheckCircle size={20} />,
			bgIcon: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
			btnText: "Confirmar Calificación",
			description: `Vas a promover a ${[lead.persona.nombres, lead.persona.apellidos].filter(Boolean).join(" ")} al estado Calificado.`,
		},
		NEGOCIACION: {
			title: "Iniciar Negociación",
			icon: <FiTrendingUp size={20} />,
			bgIcon: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
			btnText: "Mover a Negociación",
			description: `El lead ${[lead.persona.nombres, lead.persona.apellidos].filter(Boolean).join(" ")} iniciará el proceso de cotización formal.`,
		},
		PERDIDO: {
			title: "Marcar Lead como Perdido",
			icon: <FiXCircle size={20} />,
			bgIcon: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
			btnText: "Confirmar Pérdida",
			description: `Archivarás a ${[lead.persona.nombres, lead.persona.apellidos].filter(Boolean).join(" ")}. Cuéntanos qué sucedió.`,
		},
	}[targetStatus];

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-50"
						onClick={() => !isSubmitting && onClose()}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{
								type: "spring",
								stiffness: 320,
								damping: 28,
							}}
							className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-xl ${uiConfig.bgIcon}`}
									>
										{uiConfig.icon}
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											{uiConfig.title}
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											{uiConfig.description}
										</p>
									</div>
								</div>
								<button
									type="button"
									disabled={isSubmitting}
									onClick={onClose}
									className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
								>
									<FiX size={18} />
								</button>
							</div>

							<form onSubmit={handleSubmit}>
								<div className="p-6 space-y-4">
									{error && (
										<div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs">
											<FiAlertCircle
												size={16}
												className="shrink-0 mt-0.5"
											/>
											<span>{error}</span>
										</div>
									)}
									{isCalificado && (
										<div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-2">
											<div className="flex items-center gap-1.5 text-base font-semibold text-teal-800 dark:text-teal-400">
												<FiHelpCircle size={14} />
												<span>
													Criterios sugeridos de
													calificación:
												</span>
											</div>
											<ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1 pl-1">
												<li>
													¿Tiene interés real o es
													solo curiosidad?
												</li>
												<li>
													¿Su presupuesto se acopla a
													los lotes?
												</li>
												<li>
													¿Tiene identificada una zona
													o proyecto?
												</li>
												<li>
													¿Tiene ventana de tiempo de
													compra razonable?
												</li>
											</ul>
										</div>
									)}
									{isPerdido && (
										<div className="space-y-1.5">
											<label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
												Motivo del descarte{" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<textarea
												required
												disabled={isSubmitting}
												value={motivo}
												onChange={(e) =>
													setMotivo(e.target.value)
												}
												placeholder="Ej: El cliente indica que no cuenta con la cuota inicial completa por el momento..."
												rows={3}
												className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50 resize-none transition-all"
											/>
										</div>
									)}
									{!isPerdido && !isCalificado && (
										<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
											Esta acción registrará la fecha y
											hora de la transición en el
											historial cronológico del cliente
											para auditoría de rendimiento.
										</p>
									)}
								</div>
								<div className="flex justify-end items-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
									<button
										type="button"
										disabled={isSubmitting}
										onClick={onClose}
										className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
									>
										Cancelar
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
											isPerdido
												? "bg-red-600 hover:bg-red-700 active:scale-98"
												: "bg-teal-600 hover:bg-teal-700 active:scale-98"
										} disabled:opacity-50 disabled:pointer-events-none`}
									>
										{isSubmitting && (
											<BiLoaderAlt
												className="animate-spin"
												size={14}
											/>
										)}
										{uiConfig.btnText}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
};
