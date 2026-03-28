import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	FiX,
	FiUser,
	FiAlertCircle,
	FiPhone,
	FiPlus,
	FiTrash2,
} from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { SearchableSelect } from "dialca-ui";
import { useLeads } from "../hooks/useLeads";
import { useUbigeos } from "@/core/hooks/useUbigeos";
import type { ApiError } from "@/core/types";
import type {
	Actitud,
	EstadoCivil,
	Lead,
	Sexo,
	Solvencia,
	TipoTelefono,
	UpdateLeadPayload,
} from "../types";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	lead: Lead | null;
}

interface PhoneUI {
	uiId: string;
	id?: number;
	numero: string;
	tipo: TipoTelefono;
}

const selectClasses = {
	input: "bg-gray-50! dark:bg-gray-800/50! border-transparent! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! rounded-xl! disabled:opacity-50! text-sm! py-2.5! w-full!",
	option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40! text-sm!",
	dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
	clearButton: "dark:text-gray-400! dark:hover:text-gray-200!",
};

const sexoOptions = [
	{ value: "M", label: "Masculino" },
	{ value: "F", label: "Femenino" },
];
const booleanOptions = [
	{ value: "true", label: "Sí" },
	{ value: "false", label: "No" },
];
const estadoCivilOptions = [
	{ value: "SOLTERO", label: "Soltero/a" },
	{ value: "CASADO", label: "Casado/a" },
	{ value: "DIVORCIADO", label: "Divorciado/a" },
	{ value: "CONVIVIENTE", label: "Conviviente" },
];
const solvenciaOptions = [
	{ value: "EXCELENTE", label: "Excelente" },
	{ value: "BUEN_PAGADOR", label: "Buen Pagador" },
	{ value: "PAGA ATRASADO", label: "Paga Atrasado" },
	{ value: "MOROSO", label: "Moroso" },
	{ value: "DESCARTADO", label: "Descartado" },
];
const actitudOptions = [
	{ value: "AMABLE", label: "Amable" },
	{ value: "ENOJADO", label: "Enojado" },
	{ value: "DESCONFIADO", label: "Desconfiado" },
	{ value: "QUEJOSO", label: "Quejoso" },
];
const phoneTypeOptions = [
	{ value: "PERSONAL", label: "Personal" },
	{ value: "TRABAJO", label: "Trabajo" },
	{ value: "WHATSAPP", label: "WhatsApp" },
];

export const EditLeadModal = ({ isOpen, onClose, lead }: Props) => {
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
	const [deletedPhoneIds, setDeletedPhoneIds] = useState<number[]>([]);

	const [error, setError] = useState<string | null>(null);

	const { ubigeosQuery } = useUbigeos();
	const { useEditLeadMutation } = useLeads();

	useEffect(() => {
		if (isOpen && lead) {
			setNumeroDoc(lead.numero || "");
			setNombres(lead.nombres || "");
			setApellidos(lead.apellidos || "");
			setEmail(lead.email || "");
			setDireccion(lead.direccion || "");
			setOcupacion(lead.ocupacion || "");
			setFechaNacimiento(
				lead.fecha_nacimiento
					? lead.fecha_nacimiento.split("T")[0]
					: "",
			);

			setEsPeruano(
				lead.es_peruano !== null ? String(lead.es_peruano) : "true",
			);
			setSexo(lead.sexo || "");
			setEstadoCivil(lead.estado_civil || "");
			setSolvencia(lead.solvencia || "");
			setActitud(lead.actitud || "");
			setIdUbigeo(lead.id_ubigeo || "");

			if (lead.telefonos) {
				setPhones(
					lead.telefonos.map((t) => ({
						uiId: crypto.randomUUID(),
						id: t.id,
						numero: t.numero,
						tipo: t.tipo,
					})),
				);
			} else {
				setPhones([]);
			}
			setDeletedPhoneIds([]);
			setError(null);
		}
	}, [isOpen, lead]);

	const updatePayload = useMemo((): UpdateLeadPayload => {
		const payloadPhones = {
			add: phones
				.filter((p) => !p.id && p.numero.trim())
				.map((p) => ({ numero: p.numero.trim(), tipo: p.tipo })),
			update: phones
				.filter((p) => p.id && p.numero.trim())
				.map((p) => ({
					id: p.id!,
					numero: p.numero.trim(),
					tipo: p.tipo,
				})),
			remove: deletedPhoneIds,
		};

		return {
			id_tipo_doc_identidad: lead?.id_tipo_doc_identidad || 1,
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
			telefonos: payloadPhones,
		};
	}, [
		nombres,
		apellidos,
		numeroDoc,
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
		deletedPhoneIds,
		lead,
	]);

	const editLeadMutation = useEditLeadMutation(lead?.id || 0, updatePayload);
	const isSubmitting = editLeadMutation.isPending;

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

	const handleRemovePhone = (uiId: string, backId?: number) => {
		if (backId) setDeletedPhoneIds((prev) => [...prev, backId]);
		setPhones((prev) => prev.filter((p) => p.uiId !== uiId));
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, isSubmitting]);

	const ubigeoOptions =
		ubigeosQuery.data?.map((u: { id: string; nombre: string }) => ({
			value: String(u.id),
			label: `${u.id} - ${u.nombre}`,
		})) || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!numeroDoc.trim()) return setError("El número de documento es requerido.");

		try {
			editLeadMutation.mutate(undefined, {
				onSuccess: () => {
					onClose();
				},
			});
		} catch (err: unknown) {
			const message =
				(err as ApiError)?.response?.data?.message ||
				"Error al actualizar el lead.";
			setError(message);
		}
	};

	if (!lead) return null;

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
										<FiUser size={20} />
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											Editar Lead
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Actualiza la información de{" "}
											{lead.nombres || lead.numero}
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
											Datos Personales
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Nombres
												</label>
												<input
													type="text"
													value={nombres}
													onChange={(e) =>
														setNombres(
															e.target.value,
														)
													}
													disabled={isSubmitting}
													placeholder="Ej: Juan Carlos"
													className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
												/>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Apellidos
												</label>
												<input
													type="text"
													value={apellidos}
													onChange={(e) =>
														setApellidos(
															e.target.value,
														)
													}
													disabled={isSubmitting}
													placeholder="Ej: Pérez Gomez"
													className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
												/>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Documento{" "}
													<span className="text-red-500">
														*
													</span>
												</label>
												<input
													type="text"
													value={numeroDoc}
													onChange={(e) =>
														setNumeroDoc(
															e.target.value,
														)
													}
													disabled={isSubmitting}
													className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
												/>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Fecha de Nacimiento
												</label>
												<input
													type="date"
													value={fechaNacimiento}
													onChange={(e) =>
														setFechaNacimiento(
															e.target.value,
														)
													}
													disabled={isSubmitting}
													className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all scheme-light dark:scheme-dark"
												/>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
											<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
												Contacto y Teléfonos
											</h3>
											<button
												type="button"
												onClick={handleAddPhone}
												disabled={isSubmitting}
												className="text-xs flex items-center gap-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors font-medium cursor-pointer"
											>
												<FiPlus /> Añadir Teléfono
											</button>
										</div>
										<div className="flex flex-col gap-3">
											<div className="flex flex-col gap-1.5">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
													Correo Electrónico
												</label>
												<input
													type="email"
													value={email}
													onChange={(e) =>
														setEmail(e.target.value)
													}
													disabled={isSubmitting}
													placeholder="Ej: cliente@correo.com"
													className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
												/>
											</div>
											<div className="flex flex-col gap-2 mt-2">
												<AnimatePresence>
													{phones.map((phone) => (
														<motion.div
															key={phone.uiId}
															initial={{
																opacity: 0,
																y: -10,
															}}
															animate={{
																opacity: 1,
																y: 0,
															}}
															exit={{
																opacity: 0,
																height: 0,
																overflow:
																	"hidden",
															}}
															className="flex gap-2 items-center"
														>
															<div className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 shrink-0">
																<FiPhone
																	size={16}
																/>
															</div>
															<input
																type="text"
																value={phone.numero}
																onChange={(e) => handleUpdatePhone(phone.uiId,"numero",e.target.value)}
																disabled={isSubmitting}
																minLength={9}
                                                                maxLength={11}
																placeholder="Número telefónico"
																className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all flex-1"
															/>
															<div className="w-36 shrink-0">
																<select
																	value={phone.tipo}
																	onChange={(e) => handleUpdatePhone(phone.uiId,"tipo",e.target.value)}																
																	disabled={
																		isSubmitting
																	}
																	className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl text-sm text-gray-700 dark:text-gray-300 h-full border-r-8 border-transparent"
																>
																	{phoneTypeOptions.map(
																		(t) => (
																			<option
																				key={
																					t.value
																				}
																				value={
																					t.value
																				}
																			>
																				{
																					t.label
																				}
																			</option>
																		),
																	)}
																</select>
															</div>
															<button
																type="button"
																onClick={() =>
																	handleRemovePhone(
																		phone.uiId,
																		phone.id,
																	)
																}
																disabled={
																	isSubmitting
																}
																className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors shrink-0 cursor-pointer"
															>
																<FiTrash2
																	size={16}
																/>
															</button>
														</motion.div>
													))}
												</AnimatePresence>
												{phones.length === 0 && (
													<div className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
														No hay teléfonos
														registrados.
													</div>
												)}
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
											Demografía y Ubicación
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="z-50">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
													Ubicación (Ubigeo)
												</label>
												{ubigeosQuery.isLoading ? (
													<div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm animate-pulse">
														Cargando ubigeos...
													</div>
												) : (
													<SearchableSelect
														options={ubigeoOptions}
														value={idUbigeo}
														onChange={setIdUbigeo}
														placeholder="Buscar distrito/provincia..."
														classes={selectClasses}
													/>
												)}
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 block">
													Dirección exacta
												</label>
												<input
													type="text"
													value={direccion}
													onChange={(e) =>
														setDireccion(
															e.target.value,
														)
													}
													disabled={isSubmitting}
													placeholder="Ej: Av. Principal 123"
													className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
												/>
											</div>
											<div className="z-40">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
													Es Peruano
												</label>
												<SearchableSelect
													options={booleanOptions}
													value={esPeruano}
													onChange={setEsPeruano}
													placeholder="Seleccionar"
													classes={selectClasses}
												/>
											</div>
											<div className="z-30">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
													Sexo
												</label>
												<SearchableSelect
													options={sexoOptions}
													value={sexo}
													onChange={setSexo}
													placeholder="Seleccionar"
													classes={selectClasses}
												/>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4 pb-4">
										<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
											Perfil del Cliente
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="z-20">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
													Estado Civil
												</label>
												<SearchableSelect
													options={estadoCivilOptions}
													value={estadoCivil}
													onChange={setEstadoCivil}
													placeholder="Seleccionar..."
													classes={selectClasses}
												/>
											</div>
											<div className="flex flex-col gap-1.5 focus-within:z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 block">
													Ocupación
												</label>
												<input
													type="text"
													value={ocupacion}
													onChange={(e) =>
														setOcupacion(
															e.target.value,
														)
													}
													disabled={isSubmitting}
													placeholder="Ej: Ingeniero, Comerciante..."
													className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
												/>
											</div>
											<div className="z-10">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
													Solvencia (Status Pagos)
												</label>
												<SearchableSelect
													options={solvenciaOptions}
													value={solvencia}
													onChange={setSolvencia}
													placeholder="Seleccionar..."
													classes={selectClasses}
												/>
											</div>
											<div className="z-5">
												<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
													Actitud Comprador
												</label>
												<SearchableSelect
													options={actitudOptions}
													value={actitud}
													onChange={setActitud}
													placeholder="Seleccionar..."
													classes={selectClasses}
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
												"Guardar Cambios"
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
