import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	FiX,
	FiCalendar,
	FiChevronRight,
	FiChevronLeft,
	FiUserPlus,
	FiUserCheck,
	FiAlertCircle,
	FiPlus,
	FiTrash2,
} from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api";
import { useAppointments } from "../hooks/useAppointments";
import { ClientSearchAutocomplete } from "./ClientSearchAutocomplete";
import { useUbigeos } from "@/core/hooks";

import type { CreateAppointmentPayload } from "../types";
import type {
	Sexo,
	EstadoCivil,
	Solvencia,
	Actitud,
	TipoTelefono,
} from "@/features/leads/types";
import type { Lote } from "@/features/lots/types";
import type { ApiError } from "@/core/types";
import type { Etapa, Manzana, Proyecto } from "@/features/projects/types";
import { useAuthStore } from "@/features/auth";
import { classes, options } from "@/shared/constants";
import { toast } from "sonner";

const selectClasses = classes.searchableSelect

const sexoOptions = options.sexo;
const booleanOptions = options.boolean;
const estadoCivilOptions = options.estadoCivil;
const solvenciaOptions = options.solvencia;
const actitudOptions = options.actitud;
const phoneTypeOptions = options.phoneType;

interface PhoneUI {
	uiId: string;
	numero: string;
	tipo: TipoTelefono;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateAppointmentModal = ({ isOpen, onClose }: Props) => {
	const [step, setStep] = useState<1 | 2>(1);
	const [idProyecto, setIdProyecto] = useState("");
	const [idEtapa, setIdEtapa] = useState("");
	const [idManzana, setIdManzana] = useState("");
	const [idLote, setIdLote] = useState("");
	const [fechaCita, setFechaCita] = useState("");
	const [horaCita, setHoraCita] = useState("");
	const [observaciones, setObservaciones] = useState("");

	const [clientMode, setClientMode] = useState<"existing" | "new">(
		"existing",
	);
	const [selectedClientId, setSelectedClientId] = useState<number | null>(
		null,
	);

	const [numeroDoc, setNumeroDoc] = useState("");
	const [nombres, setNombres] = useState("");
	const [apellidos, setApellidos] = useState("");
	const [email, setEmail] = useState("");
	const [fechaNacimiento, setFechaNacimiento] = useState("");
	const [direccion, setDireccion] = useState("");
	const [ocupacion, setOcupacion] = useState("");

	const [esPeruano, setEsPeruano] = useState<string>("true");
	const [sexo, setSexo] = useState<string>("");
	const [estadoCivil, setEstadoCivil] = useState<string>("");
	const [solvencia, setSolvencia] = useState<string>("");
	const [actitud, setActitud] = useState<string>("");
	const [idUbigeo, setIdUbigeo] = useState<string>("");

	const [phones, setPhones] = useState<PhoneUI[]>([]);
	const [error, setError] = useState<string | null>(null);

	const { projects, useCreateAppointmentMutation } = useAppointments();
	const { ubigeosQuery } = useUbigeos();

	const { user } = useAuthStore();

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
	const ubigeoOptions =
		ubigeosQuery.data?.map((u: { id: string; nombre: string }) => ({
			value: String(u.id),
			label: `${u.id} - ${u.nombre}`,
		})) || [];

	useEffect(() => {
		if (isOpen) {
			setStep(1);
			setIdProyecto("");
			setIdEtapa("");
			setIdManzana("");
			setIdLote("");
			setFechaCita("");
			setHoraCita("");
			setObservaciones("");

			setClientMode("existing");
			setSelectedClientId(null);

			setNumeroDoc("");
			setNombres("");
			setApellidos("");
			setEmail("");
			setFechaNacimiento("");
			setDireccion("");
			setOcupacion("");
			setEsPeruano("true");
			setSexo("");
			setEstadoCivil("");
			setSolvencia("");
			setActitud("");
			setIdUbigeo("");
			setPhones([]);
			setError(null);
		}
	}, [isOpen]);

	const handleAddPhone = () => {
		setPhones([
			...phones,
			{ uiId: crypto.randomUUID(), numero: "", tipo: "PERSONAL" },
		]);
	};
	const handleUpdatePhone = (
		uiId: string,
		field: "numero" | "tipo",
		value: string,
	) => {
		setPhones((prev) =>
			prev.map((p) => (p.uiId === uiId ? { ...p, [field]: value } : p)),
		);
	};
	const handleRemovePhone = (uiId: string) => {
		setPhones((prev) => prev.filter((p) => p.uiId !== uiId));
	};

	const createPayload = useMemo((): CreateAppointmentPayload => {
		const payload: CreateAppointmentPayload = {
			id_proyecto: Number(idProyecto),
			id_lote: idLote ? Number(idLote) : null,
			id_usuario_responsable: user?.id || "",
			fecha_cita: fechaCita,
			hora_cita: horaCita,
			observaciones_visita: observaciones.trim() || undefined,
		};

		if (clientMode === "existing" && selectedClientId) {
			payload.id_cliente = selectedClientId;
		} else if (clientMode === "new") {
			payload.nuevo_cliente = {
				id_tipo_doc_identidad: 1,
				nombres: nombres.trim() || undefined,
				apellidos: apellidos.trim() || undefined,
				numero: numeroDoc.trim(),
				email: email.trim() || undefined,
				fecha_nacimiento: fechaNacimiento || undefined,
				es_peruano: esPeruano === "true",
				direccion: direccion.trim() || undefined,
				ocupacion: ocupacion.trim() || undefined,
				sexo: (sexo as Sexo) || undefined,
				estado_civil: (estadoCivil as EstadoCivil) || undefined,
				solvencia: (solvencia as Solvencia) || undefined,
				actitud: (actitud as Actitud) || undefined,
				id_ubigeo: idUbigeo || undefined,
				telefonos: phones
					.filter((p) => p.numero.trim())
					.map((p) => ({ numero: p.numero.trim(), tipo: p.tipo })),
			};
		}

		return payload;
	}, [
		idProyecto,
		idLote,
		fechaCita,
		horaCita,
		observaciones,
		clientMode,
		selectedClientId,
		numeroDoc,
		nombres,
		apellidos,
		email,
		fechaNacimiento,
		esPeruano,
		direccion,
		ocupacion,
		sexo,
		estadoCivil,
		solvencia,
		actitud,
		idUbigeo,
		phones,
	]);

	const mutation = useCreateAppointmentMutation(createPayload);
	const isSubmitting = mutation.isPending;

	const handleNextStep = () => {
		setError(null);
		if (!idProyecto) return setError("Debes seleccionar un proyecto.");
		if (!fechaCita) return setError("La fecha de la cita es obligatoria.");
		if (!horaCita) return setError("La hora de la cita es obligatoria.");
		setStep(2);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (clientMode === "existing" && !selectedClientId) {
			toast.error("Debes buscar y seleccionar un cliente existente de la agenda.");
			return setError(
				"Debes buscar y seleccionar un cliente existente de la agenda.",
			);
		}
		if (clientMode === "new" && !numeroDoc.trim()) {
			toast.error("El número de documento del nuevo cliente es obligatorio.");
			return setError(
				"El número de documento del nuevo cliente es obligatorio.",
			);
		}

		try {
			mutation.mutate(undefined, {
				onSuccess: () => onClose(),
			});
		} catch (err: unknown) {
			toast.error((err as ApiError)?.response?.data?.message || "Error al crear la cita.");
			setError(
				(err as ApiError)?.response?.data?.message ||
					"Error al crear la cita.",
			);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, isSubmitting]);

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
							{/* Header */}
							<div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
										<FiCalendar size={20} />
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											Agendar Nueva Cita
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Paso {step} de 2:{" "}
											{step === 1
												? "Programación de Visita"
												: "Asignación de Cliente"}
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
								onSubmit={
									step === 1
										? (e) => {
												e.preventDefault();
												handleNextStep();
											}
										: handleSubmit
								}
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
												<FiAlertCircle className="shrink-0" />{" "}
												<span>{error}</span>
											</motion.div>
										)}
									</AnimatePresence>
									{step === 1 && (
										<motion.div
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											className="flex flex-col gap-6"
										>
											<div className="flex flex-col gap-4">
												<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
													Información del Lote
													Analizado
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													<div className="z-50">
														<SearchableSelect
															options={proyectoOptions}
															value={idProyecto}
															onChange={(val) => {
                                                                setIdProyecto(String(val));
																setIdEtapa("");
																setIdManzana("");
																setIdLote("");
															}}
                                                            label="Seleccionar Proyecto"
                                                            required
															classes={selectClasses}
														/>
													</div>
													<div className="z-40">
														<SearchableSelect
															options={etapaOptions}
															value={idEtapa}
															onChange={(val) => {
																setIdEtapa(String(val));
																setIdManzana("");
																setIdLote("");
															}}
															label="Seleccionar Etapa"
															classes={selectClasses
															}
															disabled={!idProyecto}
														/>
													</div>
													<div className="z-30">
														<SearchableSelect
															options={manzanaOptions}
															value={idManzana}
															onChange={(val) => {
																setIdManzana(String(val));
																setIdLote("");
															}}
															label="Seleccionar Manzana"
															classes={selectClasses}
															disabled={!idEtapa}
														/>
													</div>
													<div className="z-20">
														<SearchableSelect
															options={loteOptions}
															value={idLote}
															onChange={(val) =>
																setIdLote(String(val))
															}
															label="Seleccionar Lote"
															classes={selectClasses}
															disabled={!idManzana}
														/>
													</div>
												</div>
											</div>
											<div className="flex flex-col gap-4">
												<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
													Programación de Fecha
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="flex flex-col gap-1.5 focus-within:z-10">
														<label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
															Fecha de la Cita
                                                            <span className="text-red-500">*</span>
														</label>
														<input
															type="date"
															value={fechaCita}
															onChange={(e) => setFechaCita(e.target.value)}
															disabled={isSubmitting}
                                                            min={new Date().toISOString().split("T")[0]}
															className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all scheme-light dark:scheme-dark"
														/>
													</div>
													<div className="flex flex-col gap-1.5 focus-within:z-10">
														<label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
															Hora de la Cita
                                                            <span className="text-red-500">*</span>
														</label>
														<input
															type="time"
															value={horaCita}
															onChange={(e) => setHoraCita(e.target.value)}
															disabled={isSubmitting}
															className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all scheme-light dark:scheme-dark"
														/>
													</div>
												</div>
												<div className="flex flex-col gap-1.5 focus-within:z-10">
													<label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
														Motivos u Observaciones
													</label>
													<textarea
														value={observaciones}
														onChange={(e) => setObservaciones(e.target.value)}
														disabled={isSubmitting}
														placeholder="Escribe el motivo de la cita o notas previas..."
														className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none h-24"
													/>
												</div>
											</div>
										</motion.div>
									)}
									{step === 2 && (
										<motion.div
											initial={{ opacity: 0, x: 10 }}
											animate={{ opacity: 1, x: 0 }}
											className="flex flex-col gap-6"
										>
											<div className="grid grid-cols-2 gap-4">
												<div
													onClick={() => setClientMode("existing")}
													className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${clientMode === "existing" ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-sm shadow-teal-500/10" : "border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800/50 bg-white dark:bg-gray-900"}`}
												>
													<div className="flex flex-col items-center gap-2 text-center">
														<div
															className={`p-3 rounded-full ${clientMode === "existing" ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`}
														>
															<FiUserCheck
																size={24}
															/>
														</div>
														<span
															className={`font-semibold text-sm ${clientMode === "existing" ? "text-teal-700 dark:text-teal-400" : "text-gray-600 dark:text-gray-400"}`}
														>
															Cliente Existente
														</span>
													</div>
												</div>
												<div
													onClick={() => setClientMode("new")}
													className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${clientMode === "new" ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-sm shadow-teal-500/10" : "border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800/50 bg-white dark:bg-gray-900"}`}
												>
													<div className="flex flex-col items-center gap-2 text-center">
														<div
															className={`p-3 rounded-full ${clientMode === "new" ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`}
														>
															<FiUserPlus
																size={24}
															/>
														</div>
														<span
															className={`font-semibold text-sm ${clientMode === "new" ? "text-teal-700 dark:text-teal-400" : "text-gray-600 dark:text-gray-400"}`}
														>
															Nuevo Prospecto
														</span>
													</div>
												</div>
											</div>
											<div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />
											{clientMode === "existing" ? (
												<div className="flex flex-col gap-2 min-h-75">
													<ClientSearchAutocomplete
														selectedClientId={selectedClientId}
														onSelectClient={setSelectedClientId}
													/>
												</div>
											) : (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="flex flex-col gap-6"
												>
													<div className="flex flex-col gap-4">
														<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
															Datos Personales
														</h3>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="flex flex-col gap-1.5">
                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                    Nombres
                                                                    <span className="text-red-500">*</span>
                                                                </label>
																<input
																	type="text"
																	value={nombres}
																	onChange={(e) => setNombres(e.target.value)}
																	disabled={isSubmitting}
																	placeholder="Nombres. Ej: Juan Carlos"
                                                                    required
																	className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
																/>
															</div>
															<div className="flex flex-col gap-1.5">
                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                    Apellidos
                                                                    <span className="text-red-500">*</span>
                                                                </label>
																<input
																	type="text"
																	value={apellidos}
																	onChange={(e) => setApellidos(e.target.value)}
																	disabled={isSubmitting}
																	placeholder="Apellidos. Ej: Pérez Gomez"
                                                                    required
																	className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
																/>
															</div>
															<div className="flex flex-col gap-1.5">
                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                    Número de Documento
                                                                    <span className="text-red-500">*</span>
                                                                </label>
																<input
																	type="text"
																	value={numeroDoc}
																	onChange={(e) => setNumeroDoc(e.target.value)}
																	disabled={isSubmitting}
																	placeholder="DNI / Número Doc"
                                                                    required
                                                                    minLength={8}
                                                                    maxLength={8}
																	className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
																/>
															</div>
															<div className="flex flex-col gap-1.5">
                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                    Fecha de Nacimiento
                                                                </label>
																<input
																	type="date"
																	value={fechaNacimiento}
																	onChange={(e) => setFechaNacimiento(e.target.value)}
																	disabled={isSubmitting}
                                                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                                                                    max={new Date().toISOString().split("T")[0]}
																	className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 scheme-light dark:scheme-dark"
																/>
															</div>
														</div>
													</div>
													<div className="flex flex-col gap-4">
														<div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
															<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
																Contacto y
																Teléfonos
															</h3>
															<button
																type="button"
																onClick={handleAddPhone}
																disabled={isSubmitting}
																className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 px-3 py-1.5 rounded-lg transition-colors"
															>
																<FiPlus />{" "}
																Agregar
															</button>
														</div>
														<div className="flex flex-col gap-3">
															<div className="flex flex-col gap-1.5 focus-within:z-40">
																<input
																	type="email"
																	value={email}
																	onChange={(e) => setEmail(e.target.value)}
																	disabled={isSubmitting}
																	placeholder="Correo electrónico (Opcional)"
																	className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
																/>
															</div>
															<AnimatePresence>
																{phones.map(
																	(phone) => (
																		<motion.div
																			key={phone.uiId}
																			initial={{
																				opacity: 0,
																				height: 0,
																			}}
																			animate={{
																				opacity: 1,
																				height: "auto",
																			}}
																			exit={{
																				opacity: 0,
																				height: 0,
																			}}
																			className="flex items-center gap-2 relative z-30 overflow-visible"
																		>
                                                                            <div className="flex flex-col gap-1.5 focus-within:z-40 flex-1">
                                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                                    Tipo de Teléfono
                                                                                </label>
                                                                                <SearchableSelect
                                                                                    options={phoneTypeOptions}
                                                                                    value={phone.tipo}
                                                                                    onChange={(val) =>
                                                                                        handleUpdatePhone(
                                                                                            phone.uiId,
                                                                                            "tipo",
                                                                                            String(val),
                                                                                        )
                                                                                    }
                                                                                    label=""
                                                                                    classes={selectClasses}
                                                                                    disabled={isSubmitting}
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-1.5 focus-within:z-40 flex-1">
                                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                                    Número de Teléfono
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={phone.numero}
                                                                                    onChange={(e) =>
                                                                                        handleUpdatePhone(
                                                                                            phone.uiId,
                                                                                            "numero",
                                                                                            e.target.value,
                                                                                        )
                                                                                    }
                                                                                    disabled={isSubmitting}
                                                                                    minLength={9}
                                                                                    maxLength={11}
                                                                                    placeholder="Ej: 999888777"
                                                                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
                                                                                />
                                                                            </div>
																			<button
																				type="button"
																				onClick={() => handleRemovePhone(phone.uiId)}
																				disabled={isSubmitting}
																				className="p-2.5 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
																			>
																				<FiTrash2
																					size={16}
																				/>
																			</button>
																		</motion.div>
																	),
																)}
															</AnimatePresence>
															{phones.length ===
																0 && (
																<div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex justify-center text-sm text-gray-500 dark:text-gray-400">
																	No hay
																	teléfonos
																	adicionales
																</div>
															)}
														</div>
													</div>
													<div className="flex flex-col gap-4">
														<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
															Demografía y
															Ubicación
														</h3>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="flex flex-col gap-1.5 focus-within:z-40">
																<SearchableSelect
																	options={booleanOptions}
																	value={esPeruano}
																	onChange={(val) => setEsPeruano(String(val))}
																	label="¿Nacionalidad Peruana?"
																	classes={selectClasses}
																	disabled={isSubmitting}
																/>
															</div>
															<div className="flex flex-col gap-1.5 focus-within:z-30">
																<SearchableSelect
																	options={sexoOptions}
																	value={sexo}
																	onChange={(val) => setSexo(String(val))}
																	label="Sexo"
																	classes={selectClasses}
																	disabled={isSubmitting}
																/>
															</div>
															<div className="flex flex-col gap-1.5 focus-within:z-20 md:col-span-2">
																<SearchableSelect
																	options={ubigeoOptions}
																	value={idUbigeo}
																	onChange={(val) => setIdUbigeo(String(val))}
																	label="Ubigeo (Distrito/Provincia/Dep)"
																	classes={selectClasses}
																	disabled={isSubmitting}
																/>
															</div>
															<div className="flex flex-col gap-1.5 focus-within:z-10 md:col-span-2">
																<input
																	type="text"
																	value={direccion}
																	onChange={(e) => setDireccion(e.target.value)}
																	disabled={isSubmitting}
																	placeholder="Dirección exacta"
																	className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
																/>
															</div>
														</div>
													</div>
													<div className="flex flex-col gap-4 pb-4">
														<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
															Perfil del Cliente
														</h3>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="flex flex-col gap-1.5 focus-within:z-50">
																<SearchableSelect
																	options={estadoCivilOptions}
																	value={estadoCivil}
																	onChange={(val) => setEstadoCivil(String(val))}
																	label="Estado Civil"
																	classes={selectClasses}
																	disabled={isSubmitting}
																/>
															</div>
															<div className="flex flex-col gap-1.5 focus-within:z-40">
																<SearchableSelect
																	options={solvenciaOptions}
																	value={solvencia}
																	onChange={(val) => setSolvencia(String(val))}
																	label="Nivel de Solvencia"
																	classes={selectClasses}
																	disabled={isSubmitting}
																/>
															</div>
															<div className="flex flex-col gap-1.5 focus-within:z-30">
																<SearchableSelect
																	options={actitudOptions}
																	value={actitud}
																	onChange={(val) => setActitud(String(val))}
																	label="Actitud Inicial"
																	classes={selectClasses}
																	disabled={isSubmitting}
																/>
															</div>
															<div className="flex flex-col gap-1.5 focus-within:z-20">
                                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
                                                                    Ocupación / Trabajo
                                                                </label>
																<input
																	type="text"
																	value={ocupacion}
																	onChange={(e) => setOcupacion(e.target.value)}
																	disabled={isSubmitting}
																	placeholder="Ocupación / Trabajo"
																	className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
																/>
															</div>
														</div>
													</div>
												</motion.div>
											)}
										</motion.div>
									)}
								</div>
								<div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
									<div className="flex justify-between items-center gap-3">
										{step === 2 ? (
											<button
												type="button"
												onClick={() => setStep(1)}
												disabled={isSubmitting}
												className="px-6 py-3 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors flex items-center gap-2"
											>
												<FiChevronLeft /> Atrás
											</button>
										) : (
											<div></div>
										)}
										<div className="flex justify-end gap-3 flex-1">
											<button
												type="button"
												onClick={onClose}
												disabled={isSubmitting}
												className="px-6 py-3 cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium rounded-xl transition-colors disabled:opacity-50"
											>
												Cancelar
											</button>
											{step === 1 ? (
												<button
													type="submit"
													disabled={isSubmitting}
													className="px-8 py-3 cursor-pointer bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 flex gap-2 items-center transition-colors"
												>
													Siguiente <FiChevronRight />
												</button>
											) : (
												<button
													type="submit"
													disabled={isSubmitting}
													className="px-8 py-3 cursor-pointer bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 flex gap-2 items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{isSubmitting ? (
														<>
															<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
															Programando...
														</>
													) : (
														<>
															<FiCalendar /> Crear
															Cita
														</>
													)}
												</button>
											)}
										</div>
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