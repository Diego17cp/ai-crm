import type { TipoTelefono } from "@/core/types";
import { classes, options } from "@/shared/constants";
import { SearchableSelect } from "dialca-ui";
import { AnimatePresence, motion } from "motion/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface PhoneUI {
	uiId: string;
	numero: string;
	tipo: TipoTelefono;
}

export interface NewLeadDataState {
	idTipoDoc: string;
	numeroDoc: string;
	nombres: string;
	apellidos: string;
	email: string;
	fechaNacimiento: string;
	esPeruano: string;
	nacionalidad: string;
	sexo: string;
	idUbigeo: string;
	direccion: string;
	ocupacion: string;
	estadoCivil: string;
	phones: PhoneUI[];
}

interface Props {
	isSubmitting: boolean;
	state: NewLeadDataState;
	docTypeOptions: { value: string; label: string }[];
	phoneTypeOptions: { value: string; label: string }[];
	ubigeoOptions: { value: string; label: string }[];
	onFieldChange: (
		field: keyof Omit<NewLeadDataState, "phones">,
		value: string,
	) => void;
	onAddPhone: () => void;
	onUpdatePhone: (
		uiId: string,
		field: "numero" | "tipo",
		value: string,
	) => void;
	onRemovePhone: (uiId: string) => void;
}

const selectClasses = classes.searchableSelect;

const sexoOptions = options.sexo;
const booleanOptions = options.boolean;
const estadoCivilOptions = options.estadoCivil;

export const NewLeadForAppointmentForm = ({
	isSubmitting,
	state,
	docTypeOptions,
	phoneTypeOptions,
	ubigeoOptions,
	onFieldChange,
	onAddPhone,
	onUpdatePhone,
	onRemovePhone,
}: Props) => {
	const {
		nombres,
		apellidos,
		idTipoDoc,
		numeroDoc,
		fechaNacimiento,
		esPeruano,
		email,
		phones,
		nacionalidad,
		sexo,
		idUbigeo,
		direccion,
		ocupacion,
		estadoCivil,
	} = state;
	return (
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
							onChange={(e) =>
								onFieldChange("nombres", e.target.value)
							}
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
							onChange={(e) =>
								onFieldChange("apellidos", e.target.value)
							}
							disabled={isSubmitting}
							placeholder="Apellidos. Ej: Pérez Gomez"
							required
							className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
						/>
					</div>
					<div className="flex flex-col gap-1.5 focus-within:z-10">
						<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
							Tipo de documento
							<span className="text-red-500">*</span>
						</label>
						<SearchableSelect
							value={idTipoDoc}
							onChange={(val) =>
								onFieldChange("idTipoDoc", String(val))
							}
							options={docTypeOptions}
							placeholder="Seleccione..."
							classes={selectClasses}
							disabled={isSubmitting}
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
							onChange={(e) =>
								onFieldChange("numeroDoc", e.target.value)
							}
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
							onChange={(e) =>
								onFieldChange("fechaNacimiento", e.target.value)
							}
							disabled={isSubmitting}
							min={
								new Date(
									new Date().setFullYear(
										new Date().getFullYear() - 100,
									),
								)
									.toISOString()
									.split("T")[0]
							}
							max={new Date().toISOString().split("T")[0]}
							className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20 scheme-light dark:scheme-dark"
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
						onClick={onAddPhone}
						disabled={isSubmitting}
						className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 px-3 py-1.5 rounded-lg transition-colors"
					>
						<FiPlus /> Agregar
					</button>
				</div>
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-1.5 focus-within:z-40">
						<input
							type="email"
							value={email}
							onChange={(e) =>
								onFieldChange("email", e.target.value)
							}
							disabled={isSubmitting}
							placeholder="Correo electrónico (Opcional)"
							className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
						/>
					</div>
					<AnimatePresence>
						{phones.map((phone) => (
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
											onUpdatePhone(
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
											onUpdatePhone(
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
									onClick={() => onRemovePhone(phone.uiId)}
									disabled={isSubmitting}
									className="p-2.5 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
								>
									<FiTrash2 size={16} />
								</button>
							</motion.div>
						))}
					</AnimatePresence>
					{phones.length === 0 && (
						<div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex justify-center text-sm text-gray-500 dark:text-gray-400">
							No hay teléfonos adicionales
						</div>
					)}
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
					Demografía y Ubicación
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col gap-1.5 focus-within:z-40">
						<SearchableSelect
							options={booleanOptions}
							value={esPeruano}
							onChange={(val) =>
								onFieldChange("esPeruano", String(val))
							}
							label="¿Nacionalidad Peruana?"
							classes={selectClasses}
							disabled={isSubmitting}
						/>
					</div>
					{esPeruano === "false" && (
						<div className="flex flex-col gap-1.5 focus-within:z-20 col-span-1 md:col-span-2">
							<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 block">
								Nacionalidad
							</label>
							<input
								type="text"
								value={nacionalidad}
								onChange={(e) =>
									onFieldChange(
										"nacionalidad",
										e.target.value,
									)
								}
								disabled={isSubmitting}
								placeholder="Ej: Argentina, Colombia..."
								className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
							/>
						</div>
					)}
					<div className="flex flex-col gap-1.5 focus-within:z-30">
						<SearchableSelect
							options={sexoOptions}
							value={sexo}
							onChange={(val) =>
								onFieldChange("sexo", String(val))
							}
							label="Sexo"
							classes={selectClasses}
							disabled={isSubmitting}
						/>
					</div>
					<div className="flex flex-col gap-1.5 focus-within:z-20 md:col-span-2">
						<SearchableSelect
							options={ubigeoOptions}
							value={idUbigeo}
							onChange={(val) =>
								onFieldChange("idUbigeo", String(val))
							}
							label="Ubigeo (Distrito/Provincia/Dep)"
							classes={selectClasses}
							disabled={isSubmitting}
						/>
					</div>
					<div className="flex flex-col gap-1.5 focus-within:z-10 md:col-span-2">
						<input
							type="text"
							value={direccion}
							onChange={(e) =>
								onFieldChange("direccion", e.target.value)
							}
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
							onChange={(val) =>
								onFieldChange("estadoCivil", String(val))
							}
							label="Estado Civil"
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
							onChange={(e) =>
								onFieldChange("ocupacion", e.target.value)
							}
							disabled={isSubmitting}
							placeholder="Ocupación / Trabajo"
							className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
