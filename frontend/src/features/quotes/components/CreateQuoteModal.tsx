import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiFileText, FiAlertCircle, FiCreditCard, FiUser } from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api";
import { useQuotes } from "../hooks/useQuotes";

import type { CreateQuotePayload } from "../types";
import type { Lote } from "@/features/lots/types";
import type { ApiError } from "@/core/types";
import type { Etapa, Manzana, Proyecto } from "@/features/projects/types";
import { formatCurrency } from "@/features/sales/utils/salesFormatters";
import { classes } from "@/shared/constants";
import { useDocTypes } from "@/core/hooks";

const searchableSelectClasses = classes.searchableSelect;

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateQuoteModal = ({ isOpen, onClose }: Props) => {
  const { docTypesQuery } = useDocTypes()
	const [idProyecto, setIdProyecto] = useState("");
	const [idEtapa, setIdEtapa] = useState("");
	const [idManzana, setIdManzana] = useState("");
	const [idLote, setIdLote] = useState("");
  
  const [idTipoDoc, setIdTipoDoc] = useState("");
	const [documento, setDocumento] = useState("");
	const [nombres, setNombres] = useState("");
	const [apellidos, setApellidos] = useState("");
	const [telefono, setTelefono] = useState("");
	const [email, setEmail] = useState("");

	const [tipoPago, setTipoPago] = useState<"CONTADO" | "CREDITO">("CONTADO");
	const [meses, setMeses] = useState<number | "">("");
	const [cuotaInicialDeseada, setCuotaInicialDeseada] = useState<number | "">("");
	const [descuentoSolicitado, setDescuentoSolicitado] = useState<number | "">("");

	const [error, setError] = useState<string | null>(null);

	const projectsQuery = useQuery({
		queryKey: ["projects", "all"],
		queryFn: async () => {
			const res = await apiClient.get("/projects/all");
			return res.data.data;
		},
		enabled: isOpen,
	});
	const etapasQuery = useQuery({
		queryKey: ["etapas", idProyecto],
		queryFn: async () => {
			if (!idProyecto) return [];
			const res = await apiClient.get(`/projects/etapas/${idProyecto}`);
			return res.data.data;
		},
		enabled: Boolean(idProyecto),
	});
	const manzanasQuery = useQuery({
		queryKey: ["manzanas", idEtapa],
		queryFn: async () => {
			if (!idEtapa) return [];
			const res = await apiClient.get(`/projects/etapas/${idEtapa}/manzanas`);
			return res.data.data;
		},
		enabled: Boolean(idEtapa),
	});
	const lotesQuery = useQuery({
		queryKey: ["lotes_manzana", idManzana, "disponibles"],
		queryFn: async () => {
			if (!idManzana) return [];
			const res = await apiClient.get(`/lotes?id_manzana=${idManzana}&estado=Disponible&limit=50`);
			return res.data.data;
		},
		enabled: Boolean(idManzana),
	});

	const tipoDocOptions =
		docTypesQuery.data?.map((d) => ({
			value: String(d.id),
			label: `${d.id} - ${d.nombre}`,
		})) || [];
	const proyectoOptions = projectsQuery.data?.map((p: Proyecto) => ({ value: String(p.id), label: p.nombre })) || [];
	const etapaOptions = etapasQuery.data?.map((e: Etapa) => ({ value: String(e.id), label: e.nombre })) || [];
	const manzanaOptions = manzanasQuery.data?.map((m: Manzana) => ({ value: String(m.id), label: `Mz ${m.codigo}` })) || [];
	const loteOptions = lotesQuery.data?.map((l: Lote) => ({ value: String(l.id), label: `Lote ${l.numero_lote} - $${l.precio_total}` })) || [];

	const selectedLoteData = useMemo(() => {
		if (!idLote || !lotesQuery.data) return null;
		return lotesQuery.data.find((l: Lote) => String(l.id) === idLote);
	}, [idLote, lotesQuery.data]);

	const precioLote = selectedLoteData ? Number(selectedLoteData.precio_total) : 0;

	const estimadoCredito = useMemo(() => {
		if (tipoPago !== "CREDITO" || !precioLote || !meses || Number(meses) <= 0) return null;
		const cuotaInicial = Number(cuotaInicialDeseada) || precioLote * 0.1;
		const cuotaMensual = (precioLote - cuotaInicial) / Number(meses);
		return { cuotaInicial, cuotaMensual };
	}, [tipoPago, precioLote, meses, cuotaInicialDeseada]);

	useEffect(() => {
		if (isOpen) {
			setIdProyecto("");
			setIdEtapa("");
			setIdManzana("");
			setIdLote("");
			setIdTipoDoc("");
			setDocumento("");
			setNombres("");
			setApellidos("");
			setTelefono("");
			setEmail("");
			setTipoPago("CONTADO");
			setMeses("");
			setCuotaInicialDeseada("");
			setDescuentoSolicitado("");
			setError(null);
		}
	}, [isOpen]);

	const payload = useMemo((): CreateQuotePayload => {
		const base: CreateQuotePayload = {
			id_tipo_doc: Number(idTipoDoc),
			documento_identidad: documento,
			nombres: nombres || undefined,
			apellidos: apellidos || undefined,
			telefono: telefono || undefined,
			email: email || undefined,
			id_lote: Number(idLote),
			tipo_pago: tipoPago,
		};
		if (tipoPago === "CREDITO") {
			return {
				...base,
				meses: Number(meses),
				...(cuotaInicialDeseada !== "" && { cuota_inicial_deseada: Number(cuotaInicialDeseada) }),
			};
		}
		return {
			...base,
			...(descuentoSolicitado !== "" && { descuento_solicitado: Number(descuentoSolicitado) }),
		};
	}, [idTipoDoc, documento, nombres, apellidos, telefono, email, idLote, tipoPago, meses, cuotaInicialDeseada, descuentoSolicitado]);

	const { useCreateQuoteMutation } = useQuotes();
	const mutation = useCreateQuoteMutation(payload);
	const isSubmitting = mutation.isPending;

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setError(null);

		if (!idTipoDoc || !documento.trim()) return setError("El tipo y número de documento son obligatorios.");
		if (!idLote) return setError("Debes seleccionar un lote disponible.");
		if (tipoPago === "CREDITO" && (!meses || Number(meses) <= 0)) {
			return setError("Especifica un número válido de meses para el crédito.");
		}

		mutation.mutate(undefined, {
			onSuccess: () => onClose(),
			onError: (err: unknown) => {
				setError((err as ApiError)?.response?.data?.message || "Error al crear la cotización");
			},
		});
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
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
							className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
										<FiFileText size={20} />
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											Nueva Cotización Manual
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Genera una cotización directamente desde el panel
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

							<form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
								<div className="p-6 flex-1 overflow-y-auto main-scrollbar flex flex-col gap-8">
									<AnimatePresence>
										{error && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
											>
												<FiAlertCircle className="shrink-0" /> <span>{error}</span>
											</motion.div>
										)}
									</AnimatePresence>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
										<div className="flex flex-col gap-4">
											<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
												Selección de Activo
											</h3>
											<div className="grid grid-cols-2 gap-3 relative">
												<div className="z-50 col-span-2">
													<SearchableSelect
														options={proyectoOptions}
														value={idProyecto}
														onChange={(val) => {
															setIdProyecto(String(val));
															setIdEtapa("");
															setIdManzana("");
															setIdLote("");
														}}
														label="1. Proyecto"
														required
														placeholder="Buscar..."
														classes={searchableSelectClasses}
														isClearable
													/>
												</div>
												<div className="z-40 col-span-2">
													<SearchableSelect
														options={etapaOptions}
														value={idEtapa}
														onChange={(val) => {
															setIdEtapa(String(val));
															setIdManzana("");
															setIdLote("");
														}}
														label="2. Etapa"
														required
														classes={searchableSelectClasses}
														disabled={!idProyecto}
														placeholder="Buscar..."
														isClearable
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
														label="3. Mz"
														required
														classes={searchableSelectClasses}
														disabled={!idEtapa}
														placeholder="Buscar..."
														isClearable
													/>
												</div>
												<div className="z-20">
													<SearchableSelect
														options={loteOptions}
														value={idLote}
														onChange={(val) => setIdLote(String(val))}
														label="4. Lote"
														required
														classes={searchableSelectClasses}
														disabled={!idManzana}
														placeholder="Buscar..."
														isClearable
													/>
												</div>
												{precioLote > 0 && (
													<motion.div
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														className="col-span-2 mt-1 px-4 py-3 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30 rounded-xl flex items-center justify-between"
													>
														<span className="text-xs font-semibold text-teal-700 dark:text-teal-500 uppercase">
															Valor del Lote:
														</span>
														<span className="text-lg font-bold text-teal-800 dark:text-teal-400">
															{formatCurrency(precioLote)}
														</span>
													</motion.div>
												)}
											</div>
										</div>

										<div className="flex flex-col gap-4">
											<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
												<FiUser className="text-teal-500" /> Datos del Cliente
											</h3>
											<div className="grid grid-cols-2 gap-3">
												<div className="z-20 col-span-1">
													<SearchableSelect
														options={tipoDocOptions}
														value={idTipoDoc}
														onChange={(val) => setIdTipoDoc(String(val))}
														label="Tipo Doc."
														required
														placeholder="Buscar..."
														isClearable
														classes={searchableSelectClasses}
													/>
												</div>
												<div className="flex flex-col gap-1.5 col-span-1">
													<label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
														Número de Doc. <span className="text-red-500 ml-1">*</span>
													</label>
													<input
														type="text"
														value={documento}
														onChange={(e) => setDocumento(e.target.value)}
														disabled={isSubmitting}
														placeholder="12345678"
														className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
													/>
												</div>
												<div className="flex flex-col gap-1.5 col-span-1">
													<label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombres</label>
													<input
														type="text"
														value={nombres}
														onChange={(e) => setNombres(e.target.value)}
														disabled={isSubmitting}
														placeholder="Jhon"
														className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
													/>
												</div>
												<div className="flex flex-col gap-1.5 col-span-1">
													<label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Apellidos</label>
													<input
														type="text"
														value={apellidos}
														onChange={(e) => setApellidos(e.target.value)}
														disabled={isSubmitting}
														placeholder="Doe"
														className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
													/>
												</div>
												<div className="flex flex-col gap-1.5 col-span-1">
													<label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Teléfono (WhatsApp)</label>
													<input
														type="tel"
														value={telefono}
														onChange={(e) => setTelefono(e.target.value)}
														disabled={isSubmitting}
														placeholder="987654321"
														className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
													/>
												</div>
												<div className="flex flex-col gap-1.5 col-span-1">
													<label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email</label>
													<input
														type="email"
														value={email}
														onChange={(e) => setEmail(e.target.value)}
														disabled={isSubmitting}
														placeholder="jhondoe@gmail.com"
														className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
													/>
												</div>
											</div>
										</div>
									</div>

									<div className="flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60">
										<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
											<FiCreditCard className="text-teal-500" /> Condiciones de la Cotización
										</h3>
										<div className="grid grid-cols-2 gap-4">
											<div
												onClick={() => setTipoPago("CONTADO")}
												className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${tipoPago === "CONTADO" ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-sm shadow-teal-500/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-teal-300"}`}
											>
												<div className="flex flex-col gap-1">
													<span className={`font-bold ${tipoPago === "CONTADO" ? "text-teal-700 dark:text-teal-400" : "text-gray-700 dark:text-gray-300"}`}>
														Al Contado
													</span>
													<span className="text-xs text-gray-500">Aplica descuento sobre el precio de lista.</span>
												</div>
											</div>
											<div
												onClick={() => setTipoPago("CREDITO")}
												className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${tipoPago === "CREDITO" ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-sm shadow-purple-500/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300"}`}
											>
												<div className="flex flex-col gap-1">
													<span className={`font-bold ${tipoPago === "CREDITO" ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"}`}>
														Al Crédito
													</span>
													<span className="text-xs text-gray-500">Inicial + cuotas mensuales.</span>
												</div>
											</div>
										</div>

										<AnimatePresence mode="wait">
											{tipoPago === "CONTADO" ? (
												<motion.div
													key="contado"
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
													className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-2 overflow-hidden"
												>
													<div className="flex flex-col gap-1.5 max-w-xs">
														<label className="text-xs font-semibold text-gray-500">
															Descuento a aplicar (%)
														</label>
														<input
															type="number"
															step="0.01"
															min="0"
															placeholder="Vacío = descuento oficial del proyecto"
															value={descuentoSolicitado}
															onChange={(e) => setDescuentoSolicitado(e.target.value === "" ? "" : Number(e.target.value))}
															className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
														/>
													</div>
												</motion.div>
											) : (
												<motion.div
													key="credito"
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
													className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2 overflow-hidden"
												>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
														<div className="flex flex-col gap-1.5">
															<label className="text-xs font-semibold text-gray-500">
																Plazo (meses) <span className="text-red-500 ml-1">*</span>
															</label>
															<input
																type="number"
																min="1"
																max="48"
																placeholder="Ej: 24"
																value={meses}
																onChange={(e) => setMeses(e.target.value === "" ? "" : Number(e.target.value))}
																className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
															/>
														</div>
														<div className="flex flex-col gap-1.5">
															<label className="text-xs font-semibold text-gray-500">Cuota inicial deseada</label>
															<input
																type="number"
																min="0"
																placeholder="Vacío = 10% por defecto"
																value={cuotaInicialDeseada}
																onChange={(e) => setCuotaInicialDeseada(e.target.value === "" ? "" : Number(e.target.value))}
																className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
															/>
														</div>
													</div>
													{estimadoCredito && (
														<div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50 p-4 rounded-xl grid grid-cols-2 divide-x divide-purple-200 dark:divide-purple-800/30">
															<div className="flex flex-col items-center">
																<span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
																	Inicial Estimada
																</span>
																<span className="text-xl font-bold text-gray-900 dark:text-white mt-1">
																	{formatCurrency(estimadoCredito.cuotaInicial)}
																</span>
															</div>
															<div className="flex flex-col items-center">
																<span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
																	Cuota Mensual Estimada
																</span>
																<span className="text-xl font-bold text-gray-900 dark:text-white mt-1">
																	{formatCurrency(estimadoCredito.cuotaMensual)}
																</span>
															</div>
														</div>
													)}
												</motion.div>
											)}
										</AnimatePresence>
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
											disabled={isSubmitting || precioLote === 0}
											className="px-8 py-3 cursor-pointer bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 flex gap-2 items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isSubmitting ? (
												<>
													<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
													Generando...
												</>
											) : (
												<>
													<FiFileText /> Generar Cotización
												</>
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