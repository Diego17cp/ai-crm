import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiCalendar, FiAlertCircle, FiStar } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { SearchableSelect } from "dialca-ui";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api";
import { useAppointments } from "../hooks/useAppointments";
import type { ApiError } from "@/core/types";
import type {
	Cita,
	EditAppointmentPayload,
	EstadoCita,
	Proyecto,
} from "../types";
import type { Etapa, Manzana } from "@/features/projects/types";
import type { Lote } from "@/features/lots/types";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	cita: Cita | null;
}

const selectClasses = {
	input: "bg-gray-50! dark:bg-gray-800/50! border-transparent! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! rounded-xl! disabled:opacity-50! text-sm! py-2.5! w-full!",
	option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40! text-sm!",
	dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
	clearButton: "dark:text-gray-400! dark:hover:text-gray-200!",
};

const estadoOptions = [
	{ value: "PROGRAMADA", label: "Programada" },
	{ value: "ATENDIDA", label: "Atendida" },
	{ value: "CANCELADA", label: "Cancelada" },
];

export const EditAppointmentModal = ({ isOpen, onClose, cita }: Props) => {
	const [fechaCita, setFechaCita] = useState("");
	const [horaCita, setHoraCita] = useState("");
	const [estadoCita, setEstadoCita] = useState<EstadoCita>("PROGRAMADA");
	const [observaciones, setObservaciones] = useState("");
	const [puntuacion, setPuntuacion] = useState(0);

	const [idProyecto, setIdProyecto] = useState<string>("");
	const [idEtapa, setIdEtapa] = useState<string>("");
	const [idManzana, setIdManzana] = useState<string>("");
	const [idLote, setIdLote] = useState<string>("");

	const [idResponsable, setIdResponsable] = useState<string>("");

	const [hoverRating, setHoverRating] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const { projects, useUpdateAppointmentMutation } = useAppointments();
	const isProgramada = estadoCita === "PROGRAMADA";

	const etapasQuery = useQuery({
		queryKey: ["etapas", idProyecto],
		queryFn: async () => {
			if (!idProyecto) return [];
			const response = await apiClient.get(
				`/projects/etapas/${idProyecto}`,
			);
			return response.data.data;
		},
		enabled: Boolean(idProyecto),
	});

	const manzanasQuery = useQuery({
		queryKey: ["manzanas", idEtapa],
		queryFn: async () => {
			if (!idEtapa) return [];
			const response = await apiClient.get(
				`/projects/etapas/${idEtapa}/manzanas`,
			);
			return response.data.data;
		},
		enabled: Boolean(idEtapa),
	});

	const lotesQuery = useQuery({
		queryKey: ["lotes_manzana", idManzana],
		queryFn: async () => {
			if (!idManzana) return [];
			const response = await apiClient.get(
				`/lotes?id_manzana=${idManzana}&limit=30`,
			);
			return response.data.data;
		},
		enabled: Boolean(idManzana),
	});

	useEffect(() => {
		if (isOpen && cita) {
			setFechaCita(cita.fecha_cita ? cita.fecha_cita.split("T")[0] : "");
			setHoraCita(cita.hora_cita || "");
			setEstadoCita(cita.estado_cita);
			setObservaciones(cita.observaciones_visita || "");
			setPuntuacion(cita.puntuacion_cliente || 0);
			setIdResponsable(cita.id_usuario_responsable || "");
			setIdProyecto(cita.id_proyecto ? String(cita.id_proyecto) : "");
			setIdEtapa("");
			setIdManzana("");
			setIdLote(cita.id_lote ? String(cita.id_lote) : "");

			setError(null);
		}
	}, [isOpen, cita]);

	const proyectoOptions =
		projects?.map((p: Proyecto) => ({
			value: String(p.id),
			label: p.nombre,
		})) || [];
	const etapaOptions =
		etapasQuery.data?.map((e: Etapa) => ({
			value: String(e.id),
			label: e.nombre,
		})) || [];
	const manzanaOptions =
		manzanasQuery.data?.map((m: Manzana) => ({
			value: String(m.id),
			label: `Mz ${m.codigo}`,
		})) || [];
	const loteOptions =
		lotesQuery.data?.map((l: Lote) => ({
			value: String(l.id),
			label: `Lote ${l.numero_lote}`,
		})) || [];

	const responsableOptions = [
		{
			value: idResponsable,
			label: cita?.asesor
				? `${cita.asesor.nombres} ${cita.asesor.apellidos}`
				: "Asesor Asignado",
		},
	];

	const updatePayload = useMemo((): EditAppointmentPayload => {
		return {
			id_proyecto: idProyecto ? Number(idProyecto) : undefined,
			id_lote: idLote ? Number(idLote) : null,
			id_usuario_responsable: idResponsable || undefined,
			fecha_cita: fechaCita || undefined,
			hora_cita: horaCita || undefined,
			observaciones_visita: observaciones.trim() || null,
			puntuacion_cliente: puntuacion > 0 ? puntuacion : null,
			estado_cita: estadoCita,
		};
	}, [
		idProyecto,
		idLote,
		idResponsable,
		fechaCita,
		horaCita,
		observaciones,
		puntuacion,
		estadoCita,
	]);

	const updateAppointmentMutation = useUpdateAppointmentMutation(
		cita?.id || 0,
		updatePayload,
	);
	const isSubmitting = updateAppointmentMutation.isPending;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, isSubmitting]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!fechaCita) return setError("La fecha de la cita es obligatoria.");
		if (!horaCita) return setError("La hora de la cita es obligatoria.");
		if (!idProyecto)
			return setError("Debes seleccionar un proyecto de interés.");

		try {
			updateAppointmentMutation.mutate(undefined, {
				onSuccess: () => {
					onClose();
				},
			});
		} catch (err: unknown) {
			const message =
				(err as ApiError)?.response?.data?.message ||
				"Error al actualizar la cita.";
			setError(message);
		}
	};

	if (!cita) return null;

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
							className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
										<FiCalendar size={20} />
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											Editar Cita y Resultados
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Actualiza el estado de la visita o
											reprograma
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={onClose}
									disabled={isSubmitting}
									className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors disabled:opacity-50"
								>
									<FiX size={20} />
								</button>
							</div>
							<form
								onSubmit={handleSubmit}
								className="flex flex-col flex-1 overflow-hidden min-h-0"
							>
								<div className="p-6 flex-1 overflow-y-auto main-scrollbar flex flex-col gap-6">
									<AnimatePresence>
										{error && (
											<motion.div
												initial={{
													opacity: 0,
													height: 0,
												}}
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
									<div className="flex flex-col gap-4">
										<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
											Programación de Fecha
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="flex flex-col gap-1.5 z-40">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Estado{" "}
													<span className="text-red-500">
														*
													</span>
												</label>
												<SearchableSelect
													options={estadoOptions}
													value={estadoCita}
													onChange={(val) => setEstadoCita(val as EstadoCita)}
													placeholder="Seleccionar"
													classes={selectClasses}
												/>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Fecha{" "}
													<span className="text-red-500">
														*
													</span>
												</label>
												<input
													type="date"
													value={fechaCita}
													onChange={(e) => setFechaCita(e.target.value)}
													disabled={isSubmitting}
													className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all scheme-light dark:scheme-dark"
												/>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Hora{" "}
													<span className="text-red-500">
														*
													</span>
												</label>
												<input
													type="time"
													value={horaCita}
													onChange={(e) => setHoraCita(e.target.value)}
													disabled={isSubmitting}
													className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all scheme-light dark:scheme-dark"
												/>
											</div>
											<div className="flex flex-col gap-1.5 z-30 md:col-span-3">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Asesor Responsable
												</label>
												<SearchableSelect
													options={responsableOptions}
													value={idResponsable}
													onChange={setIdResponsable}
													placeholder="Seleccionar asesor"
													classes={selectClasses}
													disabled={true}
												/>
												<p className="text-[10px] text-gray-400 ml-1">
													Para transferir responsable
													se debe reasignar la cita en
													el calendario de leads (API
													no disponible
													temporalmente).
												</p>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
											Información del Lote Analizado
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<div className="z-50">
												<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1 block">
													Proyecto{" "}
													<span className="text-red-500">
														*
													</span>
												</label>
												<SearchableSelect
													options={proyectoOptions}
													value={idProyecto}
													onChange={(val) => {
														setIdProyecto(val);
														setIdEtapa("");
														setIdManzana("");
														setIdLote("");
													}}
													placeholder="Seleccionar"
													classes={selectClasses}
												/>
											</div>
											<div className="z-40">
												<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1 block">
													Etapa
												</label>
												{etapasQuery.isLoading ? (
													<div className="h-10.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
												) : (
													<SearchableSelect
														options={etapaOptions}
														value={idEtapa}
														onChange={(val) => {
															setIdEtapa(val);
															setIdManzana("");
															setIdLote("");
														}}
														placeholder="Filtro opcional"
														disabled={!idProyecto}
														classes={selectClasses}
													/>
												)}
											</div>
											<div className="z-30">
												<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1 block">
													Manzana
												</label>
												{manzanasQuery.isLoading ? (
													<div className="h-10.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
												) : (
													<SearchableSelect
														options={manzanaOptions}
														value={idManzana}
														onChange={(val) => {
															setIdManzana(val);
															setIdLote("");
														}}
														placeholder="Filtro opcional"
														disabled={!idEtapa}
														classes={selectClasses}
													/>
												)}
											</div>
											<div className="z-20">
												<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1 block">
													Lote Opcional
												</label>
												{lotesQuery.isLoading ? (
													<div className="h-10.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
												) : (
													<SearchableSelect
														options={loteOptions}
														value={idLote}
														onChange={setIdLote}
														placeholder="Indica Lote"
														disabled={
															!idManzana &&
															loteOptions.length === 0
														}
														classes={selectClasses}
													/>
												)}
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4 pb-4">
										<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
											Feedback y Conclusiones
										</h3>
										<div className="flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
											<div className="flex flex-col gap-2">
												<label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
													Calificación del Cliente
													sobre el proyecto
												</label>
												<div
													className="flex gap-1"
													onMouseLeave={() => setHoverRating(0)}
												>
													{[1, 2, 3, 4, 5].map((star) => (
															<button
																key={star}
																type="button"
																disabled={
																	isSubmitting ||
																	isProgramada
																}
																onClick={() => setPuntuacion(star)}
																onMouseEnter={() => setHoverRating(star)}
																className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
															>
																<FiStar
																	size={24}
																	className={`transition-colors duration-200 ${
																		(hoverRating || puntuacion) >= star
																			? "fill-amber-400 text-amber-400"
																			: "fill-transparent text-gray-300 dark:text-gray-600"
																	}`}
																/>
															</button>
														),
													)}
													<span className="ml-3 text-xs text-gray-400 self-center">
														{isProgramada
															? "(Puntúa solo citas Atendidas)"
															: puntuacion > 0
																? `${puntuacion}/5`
																: "Sin calificar"}
													</span>
												</div>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-bold text-gray-700 dark:text-gray-300">
													Apuntes y Observaciones
												</label>
												<textarea
													value={observaciones}
													onChange={(e) => setObservaciones(e.target.value)}
													disabled={isSubmitting}
													rows={4}
													placeholder="Anota comportamientos financieros, objeciones u horas donde prefiere que se le devuelva la llamada."
													className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none main-scrollbar"
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
									<div className="flex justify-end gap-3">
										<button
											type="button"
											onClick={onClose}
											disabled={isSubmitting}
											className="px-6 py-3 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors disabled:opacity-50"
										>
											Cancelar
										</button>
										<button
											type="submit"
											disabled={isSubmitting}
											className="px-8 py-3 cursor-pointer bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 flex gap-2 items-center transition-colors disabled:opacity-50"
										>
											{isSubmitting ? (
												<>
													<BiLoaderAlt className="animate-spin" />{" "}
													Guardando...
												</>
											) : (
												"Guardar Cita"
											)}
										</button>
									</div>
								</div>
							</form>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
};
