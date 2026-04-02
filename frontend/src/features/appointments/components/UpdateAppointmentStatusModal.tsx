import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheckCircle, FiXCircle, FiX, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { useAppointments } from "../hooks/useAppointments";
import type { Cita, EditAppointmentPayload } from "../types";
import type { AppointmentModalType } from "../hooks/useAppointmentsModals";
import type { ApiError } from "@/core/types";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	cita: Cita | null;
	type: AppointmentModalType;
}

export const UpdateAppointmentStatusModal = ({
	isOpen,
	onClose,
	cita,
	type,
}: Props) => {
	const [error, setError] = useState<string | null>(null);

	const isAttending = type === "mark_attended";
	const nuevoEstado = isAttending ? "ATENDIDA" : "CANCELADA";

	const { useUpdateAppointmentMutation } = useAppointments();

	const updateMutation = useUpdateAppointmentMutation(cita ? cita.id : 0, {
		estado_cita: nuevoEstado,
	} as EditAppointmentPayload);

	const isSubmitting = updateMutation.isPending;

	useEffect(() => {
		if (isOpen) setError(null);
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, isSubmitting]);

	if (!cita || (type !== "mark_attended" && type !== "mark_canceled"))
		return null;

	const clienteNombre = cita.cliente
		? `${cita.cliente.nombres} ${cita.cliente.apellidos}`.trim()
		: "el cliente";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			await updateMutation.mutateAsync();
			onClose();
		} catch (err: unknown) {
			const message =
				(err as ApiError)?.response?.data?.message ||
				`Error al marcar la cita como ${nuevoEstado.toLowerCase()}`;
			setError(message);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
						onClick={() => !isSubmitting && onClose()}
					/>
					<div className="fixed inset-0 z-115 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
							}}
							className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-xl ${isAttending ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"}`}
									>
										{isAttending ? (
											<FiCheckCircle size={20} />
										) : (
											<FiXCircle size={20} />
										)}
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											{isAttending
												? "Marcar como Atendida"
												: "Cancelar Cita"}
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Confirmación de estado
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									disabled={isSubmitting}
									type="button"
									className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors disabled:opacity-50"
								>
									<FiX size={20} />
								</button>
							</div>
							<form
								onSubmit={handleSubmit}
								className="p-6 flex flex-col gap-5"
							>
								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{
												opacity: 1,
												height: "auto",
											}}
											exit={{ opacity: 0, height: 0 }}
											className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
										>
											<FiAlertCircle className="shrink-0" />
											<span>{error}</span>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="text-sm text-gray-700 dark:text-gray-300 ml-1 leading-relaxed">
									{isAttending ? (
										<>
											¿Confirmas que la cita con el
											prospecto{" "}
											<strong className="text-gray-900 dark:text-white capitalize">
												{clienteNombre}
											</strong>{" "}
											se ha llevado a cabo exitosamente?
											Su estado cambiará a{" "}
											<strong>Atendida</strong>.
										</>
									) : (
										<>
											¿Estás seguro de que deseas cancelar
											la cita programada con{" "}
											<strong className="text-gray-900 dark:text-white capitalize">
												{clienteNombre}
											</strong>
											? Esta acción actualizará su estado
											temporalmente a{" "}
											<strong>Cancelada</strong>.
										</>
									)}
								</div>

								<div className="mt-2 flex gap-3">
									<button
										type="button"
										onClick={onClose}
										disabled={isSubmitting}
										className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
									>
										Atrás
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={`flex-1 cursor-pointer py-3 px-4 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
											isAttending
												? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-500/20"
												: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-500/20"
										}`}
									>
										{isSubmitting ? (
											<>
												<BiLoaderAlt className="animate-spin text-lg" />
												<span>Procesando...</span>
											</>
										) : isAttending ? (
											"Sí, Atendida"
										) : (
											"Sí, Cancelarla"
										)}
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
