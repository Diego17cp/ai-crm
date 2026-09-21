import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	FiX,
	FiCalendar,
	FiChevronRight,
	FiChevronLeft,
	FiAlertCircle,
	FiTarget,
	FiUser,
} from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api";
import { useAppointments } from "../hooks/useAppointments";
import { ClientSearchAutocomplete } from "./ClientSearchAutocomplete";
import { useDocTypes, useUbigeos } from "@/core/hooks";

import type { Lote } from "@/features/lots/types";
import type { Etapa, Manzana, Proyecto } from "@/features/projects/types";
import { classes, options } from "@/shared/constants";
import { CardCheckbox } from "@/shared/components/CardCheckbox";
import { FaHandshake } from "react-icons/fa";
import { NewLeadForAppointmentForm } from "./NewLeadAppointmentForm";
import { useCreateAppointment } from "../hooks/useCreateAppointment";

const selectClasses = classes.searchableSelect;
const phoneTypeOptions = options.phoneType;

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateAppointmentModal = ({ isOpen, onClose }: Props) => {
	const {
		step,
		idProyecto,
		idEtapa,
		idManzana,
		idLote,
		fechaCita,
		horaCita,
		observaciones,
		clientMode,
		selectedClientId,
		selectedLeadId,
		error,
		setStep,
		setIdProyecto,
		setIdEtapa,
		setIdManzana,
		setIdLote,
		setFechaCita,
		setHoraCita,
		setObservaciones,
		setClientMode,
		setSelectedClientId,
		setSelectedLeadId,
		handleAddPhone,
		handleUpdatePhone,
		handleRemovePhone,
		handleFieldChange,
		handleNextStep,
		handleSubmit,
		isSubmitting,
		leadFieldsState
	} = useCreateAppointment(isOpen, onClose);

	const { projects } = useAppointments();
	const { ubigeosQuery } = useUbigeos();
	const { docTypesQuery } = useDocTypes();

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
	const docTypeOptions =
		docTypesQuery.data?.map((d) => ({
			value: String(d.id),
			label: `${d.id} - ${d.nombre}`,
		})) || [];

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
															options={
																proyectoOptions
															}
															value={idProyecto}
															onChange={(val) => {
																setIdProyecto(
																	String(val),
																);
																setIdEtapa("");
																setIdManzana(
																	"",
																);
																setIdLote("");
															}}
															label="Seleccionar Proyecto"
															required
															classes={
																selectClasses
															}
															isClearable
														/>
													</div>
													<div className="z-40">
														<SearchableSelect
															options={
																etapaOptions
															}
															value={idEtapa}
															onChange={(val) => {
																setIdEtapa(
																	String(val),
																);
																setIdManzana(
																	"",
																);
																setIdLote("");
															}}
															label="Seleccionar Etapa"
															classes={
																selectClasses
															}
															disabled={
																!idProyecto
															}
															isClearable
														/>
													</div>
													<div className="z-30">
														<SearchableSelect
															options={
																manzanaOptions
															}
															value={idManzana}
															onChange={(val) => {
																setIdManzana(
																	String(val),
																);
																setIdLote("");
															}}
															label="Seleccionar Manzana"
															classes={
																selectClasses
															}
															disabled={!idEtapa}
															isClearable
														/>
													</div>
													<div className="z-20">
														<SearchableSelect
															options={
																loteOptions
															}
															value={idLote}
															onChange={(val) =>
																setIdLote(
																	String(val),
																)
															}
															label="Seleccionar Lote"
															classes={
																selectClasses
															}
															disabled={
																!idManzana
															}
															isClearable
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
															<span className="text-red-500">
																*
															</span>
														</label>
														<input
															type="date"
															value={fechaCita}
															onChange={(e) =>
																setFechaCita(
																	e.target
																		.value,
																)
															}
															disabled={
																isSubmitting
															}
															min={
																new Date()
																	.toISOString()
																	.split(
																		"T",
																	)[0]
															}
															className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all scheme-light dark:scheme-dark"
														/>
													</div>
													<div className="flex flex-col gap-1.5 focus-within:z-10">
														<label className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-1">
															Hora de la Cita
															<span className="text-red-500">
																*
															</span>
														</label>
														<input
															type="time"
															value={horaCita}
															onChange={(e) =>
																setHoraCita(
																	e.target
																		.value,
																)
															}
															disabled={
																isSubmitting
															}
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
														onChange={(e) =>
															setObservaciones(
																e.target.value,
															)
														}
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
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<CardCheckbox
													value={
														clientMode ===
														"existing_client"
													}
													onChange={() => {
														setClientMode(
															"existing_client",
														);
														setSelectedLeadId(null);
													}}
													title="Cliente existente"
													icon={FaHandshake}
													className="p-3!"
													compact
												/>
												<CardCheckbox
													value={
														clientMode ===
														"existing_lead"
													}
													onChange={() => {
														setClientMode(
															"existing_lead",
														);
														setSelectedClientId(
															null,
														);
													}}
													title="Lead existente"
													icon={FiUser}
													className="p-3!"
													compact
												/>
												<CardCheckbox
													value={
														clientMode ===
														"new_lead"
													}
													onChange={() => {
														setClientMode(
															"new_lead",
														);
														setSelectedClientId(
															null,
														);
														setSelectedLeadId(null);
													}}
													title="Nuevo Lead"
													icon={FiTarget}
													className="p-3!"
													compact
												/>
											</div>
											<div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />
											{clientMode ===
											"existing_client" ? (
												<div className="flex flex-col gap-2 min-h-75">
													<ClientSearchAutocomplete
														selectedClientId={
															selectedClientId
														}
														onSelectClient={
															setSelectedClientId
														}
													/>
												</div>
											) : clientMode ===
											  "existing_lead" ? (
												<div className="flex flex-col gap-2 min-h-75">
													<ClientSearchAutocomplete
														isLead
														selectedClientId={
															selectedLeadId
														}
														onSelectClient={
															setSelectedLeadId
														}
													/>
												</div>
											) : (
												<NewLeadForAppointmentForm
													isSubmitting={isSubmitting}
													docTypeOptions={
														docTypeOptions
													}
													phoneTypeOptions={
														phoneTypeOptions
													}
													ubigeoOptions={
														ubigeoOptions
													}
													onFieldChange={
														handleFieldChange
													}
													state={leadFieldsState}
													onAddPhone={handleAddPhone}
													onUpdatePhone={
														handleUpdatePhone
													}
													onRemovePhone={
														handleRemovePhone
													}
												/>
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
