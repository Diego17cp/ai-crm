import { AnimatePresence, motion } from "motion/react";
import {
	FiMoreVertical,
	FiPhone,
	FiMail,
	FiMapPin,
	FiUser,
	FiEdit2,
	FiTrash2,
	FiBriefcase,
	FiCalendar,
	FiChevronDown,
	FiGlobe,
	FiHeart,
	FiCheckCircle,
	FiTrendingUp,
	FiXCircle,
} from "react-icons/fi";
import { useState } from "react";

import { useClickOutside } from "@/shared/hooks";
import type { Lead, ManualStatus } from "../types";
import { getDotStateColor, getStateColor } from "../utils/leadsFormatters";
import { DetailItem } from "./DetailItem";
import { TimelineItem } from "./TimelineItem";
import { PhoneLinkBadge } from "@/shared/components";
import { useAuthStore } from "@/features/auth";

interface LeadCardProps {
	lead: Lead;
	onEdit?: () => void;
	onDelete?: () => void;
	onChangeStatus?: (status: ManualStatus) => void;
}

const formatDate = (date: string | null) => {
	if (!date) return null;

	const parsed = new Date(date);

	if (Number.isNaN(parsed.getTime())) return null;

	return new Intl.DateTimeFormat("es-PE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(parsed);
};

const getInitials = (nombres: string | null, apellidos: string | null) => {
	const firstName = nombres?.trim().charAt(0);
	const lastName = apellidos?.trim().charAt(0);

	return `${firstName ?? ""}${lastName ?? ""}`.toUpperCase() || null;
};

const getFullName = (nombres: string | null, apellidos: string | null) => {
	return [nombres, apellidos].filter(Boolean).join(" ") || "Sin nombre";
};

const getNationality = (lead: Lead) => {
	if (lead.persona.es_peruano === true) return "Peruana";
	if (lead.persona.nacionalidad) return lead.persona.nacionalidad;

	return "No especificada";
};

export const LeadCard = ({ lead, onEdit, onDelete, onChangeStatus }: LeadCardProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	const menuRef = useClickOutside(() => setIsMenuOpen(false));

	const { persona } = lead;
	const { isAdmin } = useAuthStore()

	const fullName = getFullName(persona.nombres, persona.apellidos);
	const initials = getInitials(persona.nombres, persona.apellidos);

	const stateColor = getStateColor(lead.estado);
	const stateDotColor = getDotStateColor(lead.estado);

	const createdDate = formatDate(lead.created_at);
	const contactDate = formatDate(lead.fecha_contacto);
	const qualificationDate = formatDate(lead.fecha_calificacion);
	const closingDate = formatDate(lead.fecha_cierre);

	const isLost = Boolean(lead.motivo_perdida);

	return (
		<motion.article
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className="
        group relative 
        rounded-xl
        border border-gray-200/80 dark:border-gray-800
        bg-white dark:bg-gray-900
        shadow-sm
        transition-colors duration-200
        hover:border-gray-300 dark:hover:border-gray-700
      "
		>
			<div
				className={`absolute inset-x-0 top-0 h-0.5 ${stateDotColor}`}
			/>

			<div className="p-5">
				<header className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3.5">
						<div
							className="
                relative flex h-11 w-11 shrink-0 items-center justify-center
                rounded-full
                bg-gray-100 dark:bg-gray-800
                text-sm font-semibold
                text-gray-700 dark:text-gray-200
              "
						>
							{initials ? (
								initials
							) : (
								<FiUser className="text-gray-400" size={18} />
							)}
							<span
								className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${stateDotColor}`}
								title={lead.estado}
							/>
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<h3
									className="
                    truncate
                    text-[15px] font-semibold
                    tracking-[-0.01em]
                    text-gray-900 dark:text-white
                  "
									title={fullName}
								>
									{fullName}
								</h3>
								<span
									className={`
										inline-flex items-center gap-1.5
										rounded-full
										px-2.5 py-1
										text-[11px] font-semibold
										uppercase tracking-wide
										${stateColor}`}
								>
									<span
										className={`h-1.5 w-1.5 rounded-full ${stateDotColor}`}
									/>

									{lead.estado.replace("_", " ")}
								</span>
							</div>
							<div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
								<span>
									{persona.tipo_doc?.nombre ?? "Documento"}
								</span>
								<span className="text-gray-300 dark:text-gray-700">
									·
								</span>
								<span className="font-mono">
									{persona.numero || "Sin documento"}
								</span>
							</div>
						</div>
					</div>
					<div className="relative shrink-0" ref={menuRef}>
						<button
							type="button"
							onClick={() => setIsMenuOpen((value) => !value)}
							className="
                rounded-lg p-1.5
                text-gray-400
                transition-colors
                hover:bg-gray-100 hover:text-gray-700
                dark:hover:bg-gray-800 dark:hover:text-gray-200
                cursor-pointer
              "
							aria-label="Opciones del lead"
						>
							<FiMoreVertical size={18} />
						</button>
						{isMenuOpen && (
							<motion.div
								initial={{ opacity: 0, y: -4, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{ duration: 0.12 }}
								className="
                  absolute right-1/2 translate-x-1/2 top-full z-30 mt-1.5 w-48
                  overflow-hidden rounded-lg
                  border border-gray-200
                  bg-white shadow-lg
                  dark:border-gray-700 dark:bg-gray-800
                "
							>
								<button
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										onEdit?.();
									}}
									className="
                    flex w-full items-center gap-2
                    px-3.5 py-2.5
                    text-left text-sm
                    text-gray-700 dark:text-gray-300
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                    cursor-pointer
                  "
								>
									<FiEdit2 size={14} />
									Editar
								</button>
								<button
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										onChangeStatus?.("CALIFICADO");
									}}
									className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
								>
									<FiCheckCircle
										size={14}
										className="text-teal-500"
									/>
									Calificar Lead
								</button>

								<button
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										onChangeStatus?.("NEGOCIACION");
									}}
									className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
								>
									<FiTrendingUp
										size={14}
										className="text-teal-500"
									/>
									Iniciar Negociación
								</button>

								<div className="h-px bg-gray-100 dark:bg-gray-700" />

								<button
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										onChangeStatus?.("PERDIDO");
									}}
									className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
								>
									<FiXCircle size={14} />
									Marcar Perdido
								</button>
								{isAdmin && (
									<>
										<div className="h-px bg-gray-100 dark:bg-gray-700" />
										<button
											type="button"
											onClick={() => {
												setIsMenuOpen(false);
												onDelete?.();
											}}
											className="
												flex w-full items-center gap-2
												px-3.5 py-2.5
												text-left text-sm
												text-red-600 dark:text-red-400
												hover:bg-red-50 dark:hover:bg-red-900/10
												cursor-pointer
											"
										>
											<FiTrash2 size={14} />
											Eliminar
										</button>
									</>
								)}
							</motion.div>
						)}
					</div>
				</header>
				<div className="mt-6 mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{persona.telefonos.length > 0 ? (
						persona.telefonos.map((tel) => (
							<PhoneLinkBadge tel={tel} key={tel.id} />
						))
					) : (
						<div className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-gray-400">
							<FiPhone size={15} />
							<span>Sin teléfono</span>
						</div>
					)}
					{persona.email ? (
						<a
							href={`mailto:${persona.email}`}
							className="
                flex min-w-0 items-center gap-2.5
                rounded-lg px-2 py-1.5
                text-sm
								border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-300
                transition-colors
                hover:bg-gray-50 dark:hover:bg-gray-800
              "
						>
							<FiMail
								size={15}
								className="shrink-0 text-gray-400"
							/>

							<span className="truncate">{persona.email}</span>
						</a>
					) : (
						<div className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-gray-400">
							<FiMail size={15} />
							<span>Sin correo</span>
						</div>
					)}
				</div>
				{persona.ubigeo && (
					<div className="flex min-w-0 items-center gap-2.5 py-1.5 text-sm text-gray-600 dark:text-gray-400">
						<FiMapPin
							size={15}
							className="shrink-0 text-gray-400"
						/>

						<span className="truncate">
							{persona.ubigeo.nombre}
						</span>
					</div>
				)}
				<div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
					<div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
						<FiCalendar size={13} />
						Seguimiento
					</div>

					<div className="grid grid-cols-4 gap-2">
						<TimelineItem
							label="Creado"
							date={createdDate}
							active
						/>

						<TimelineItem
							label="Contacto"
							date={contactDate}
							active={Boolean(contactDate)}
						/>

						<TimelineItem
							label="Calificado"
							date={qualificationDate}
							active={Boolean(qualificationDate)}
						/>

						<TimelineItem
							label="Cierre"
							date={closingDate}
							active={Boolean(closingDate)}
						/>
					</div>
				</div>
				{isLost && (
					<div className="mt-4 rounded-lg border border-red-100 bg-red-50/70 px-3.5 py-3 dark:border-red-900/30 dark:bg-red-950/20">
						<span className="text-[11px] font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
							Motivo de pérdida
						</span>

						<p className="mt-1 text-sm text-red-700 dark:text-red-300">
							{lead.motivo_perdida}
						</p>
					</div>
				)}
				<button
					type="button"
					onClick={() => setIsDetailsOpen((value) => !value)}
					className="
            mt-4 flex w-full items-center justify-between
            border-t border-gray-100 pt-3
            text-xs font-medium
            text-gray-500
            transition-colors
            hover:text-gray-800
            dark:border-gray-800
            dark:text-gray-400
            dark:hover:text-gray-200
            cursor-pointer
          "
				>
					<span>
						{isDetailsOpen
							? "Ocultar información personal"
							: "Ver información personal"}
					</span>

					<FiChevronDown
						size={15}
						className={`transition-transform duration-200 ${
							isDetailsOpen ? "rotate-180" : ""
						}`}
					/>
				</button>

				<AnimatePresence>
					{isDetailsOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.25, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
								<DetailItem
									icon={<FiBriefcase size={14} />}
									label="Ocupación"
									value={persona.ocupacion}
								/>

								<DetailItem
									icon={<FiGlobe size={14} />}
									label="Nacionalidad"
									value={getNationality(lead)}
								/>

								<DetailItem
									icon={<FiUser size={14} />}
									label="Sexo"
									value={
										persona.sexo === "M"
											? "Masculino"
											: persona.sexo === "F"
												? "Femenino"
												: null
									}
								/>

								<DetailItem
									icon={<FiHeart size={14} />}
									label="Estado civil"
									value={persona.estado_civil}
								/>

								<DetailItem
									icon={<FiCalendar size={14} />}
									label="Nacimiento"
									value={formatDate(persona.fecha_nacimiento)}
								/>
								<DetailItem
									icon={<FiMapPin size={14} />}
									label="Dirección"
									value={persona.direccion}
								/>
								<DetailItem
									label="Última actualización"
									value={formatDate(lead.updated_at)}
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.article>
	);
};
