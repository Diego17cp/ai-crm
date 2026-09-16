import { motion, AnimatePresence } from "motion/react";
import {
	FiMoreVertical,
	FiCalendar,
	FiClock,
	FiUser,
	FiMapPin,
	FiEdit2,
	FiCheckCircle,
	FiXCircle,
	FiTrash2,
	FiFileText,
	FiPhone,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { useClickOutside } from "@/shared/hooks";
import type { Cita } from "../types";
import { formatDate, formatTime } from "../utils/appointmentsFormatters";
import { useAuthStore } from "@/features/auth";

interface AppointmentCardProps {
	cita: Cita;
	onEdit?: () => void;
	onMarkAttended?: () => void;
	onMarkCanceled?: () => void;
	onDelete?: () => void;
}

const appointmentStatusConfig = {
	PROGRAMADA: {
		border: "border-blue-100 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-500/50",
		glow: "hover:shadow-blue-500/5",
		badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
	},
	ATENDIDA: {
		border: "border-emerald-100 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-500/50",
		glow: "hover:shadow-emerald-500/5",
		badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
	},
	CANCELADA: {
		border: "border-red-100 dark:border-red-900/40 hover:border-red-400 dark:hover:border-red-500/50",
		glow: "hover:shadow-red-500/5",
		badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200/60 dark:border-red-800/40",
	},
};

export const AppointmentCard = ({
	cita,
	onEdit,
	onMarkAttended,
	onMarkCanceled,
	onDelete,
}: AppointmentCardProps) => {
	const { isAdmin } = useAuthStore();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useClickOutside(() => setIsMenuOpen(false));

	const isProgramada = cita.estado_cita === "PROGRAMADA";
	const currentStyle =
		appointmentStatusConfig[cita.estado_cita] ||
		appointmentStatusConfig.PROGRAMADA;

	const clienteNombre = cita.persona
		? `${cita.persona.nombres} ${cita.persona.apellidos}`.trim()
		: "Cliente Desconocido";
	const asesorNombre = cita.asesor
		? `${cita.asesor.nombres} ${cita.asesor.apellidos}`.trim()
		: "Asesor no asignado";

	const avatarInitials = cita.asesor
		? `${cita.asesor.nombres?.[0] || ""}${cita.asesor.apellidos?.[0] || ""}`.toUpperCase()
		: "??";

	const telefonoPrincipal = cita.persona?.telefonos?.[0];

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -3 }}
			transition={{ type: "spring", stiffness: 350, damping: 28 }}
			className={`
				bg-white dark:bg-gray-900 border rounded-2xl p-5 
				shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 relative group/card
				${currentStyle.border} ${currentStyle.glow}
			`}
		>
			<div className="flex justify-between items-start">
				<div className="flex items-center gap-3">
					<div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700/60 flex items-center justify-center shrink-0">
						<FiCalendar size={16} />
					</div>
					<div className="flex flex-col min-w-0">
						<h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
							{formatDate(cita.fecha_cita)}
						</h4>
						{cita.hora_cita && (
							<p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
								<FiClock size={12} className="text-gray-400" />
								{formatTime(cita.hora_cita)} hrs
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1.5">
					<span
						className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md shadow-xs ${currentStyle.badge}`}
					>
						{cita.estado_cita}
					</span>

					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
						>
							<FiMoreVertical size={18} />
						</button>

						<AnimatePresence>
							{isMenuOpen && (
								<motion.div
									initial={{
										opacity: 0,
										scale: 0.95,
										y: -4,
										transformOrigin: "top right",
									}}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: -4 }}
									className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/80 overflow-hidden z-20 py-1"
								>
									<button
										onClick={() => {
											setIsMenuOpen(false);
											onEdit?.();
										}}
										className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors text-left"
									>
										<FiEdit2
											size={13}
											className="text-blue-500"
										/>
										Editar Cita
									</button>
									{isProgramada && (
										<>
											<button
												onClick={() => {
													setIsMenuOpen(false);
													onMarkAttended?.();
												}}
												className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-colors text-left font-medium"
											>
												<FiCheckCircle size={13} />
												Marcar Atendida
											</button>
											<button
												onClick={() => {
													setIsMenuOpen(false);
													onMarkCanceled?.();
												}}
												className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors text-left font-medium"
											>
												<FiXCircle size={13} />
												Marcar Cancelada
											</button>
										</>
									)}
									{isAdmin && (
										<>
											<div className="h-px bg-gray-100 dark:bg-gray-700 my-1 w-full" />
											<button
												onClick={() => {
													setIsMenuOpen(false);
													onDelete?.();
												}}
												className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-colors text-left font-medium"
											>
												<FiTrash2 size={13} />
												Eliminar Cita
											</button>
										</>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="p-1 bg-teal-50 dark:bg-teal-950/40 rounded-md text-teal-600 dark:text-teal-400 shrink-0">
							<FiUser size={13} />
						</div>
						<p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
							{clienteNombre}
						</p>
					</div>

					{telefonoPrincipal && (
						<a
							href={
								telefonoPrincipal.tipo === "WHATSAPP"
									? `https://wa.me/${telefonoPrincipal.numero}`
									: `tel:${telefonoPrincipal.numero}`
							}
							target={
								telefonoPrincipal.tipo === "WHATSAPP"
									? "_blank"
									: undefined
							}
							rel="noopener noreferrer"
							className={`p-1.5 rounded-lg border text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all ${
								telefonoPrincipal.tipo === "WHATSAPP"
									? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950"
									: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/60"
							}`}
							title={`Contactar por ${telefonoPrincipal.tipo}`}
							onClick={(e) => e.stopPropagation()}
						>
							{telefonoPrincipal.tipo === "WHATSAPP" ? (
								<FaWhatsapp size={14} />
							) : (
								<FiPhone size={14} />
							)}
						</a>
					)}
				</div>

				{cita.proyecto && (
					<div className="flex items-start gap-2.5">
						<div className="p-1 bg-teal-50 dark:bg-teal-950/40 rounded-md text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
							<FiMapPin size={13} />
						</div>
						<div className="flex flex-col min-w-0 leading-tight">
							<span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate">
								{cita.proyecto.nombre}
								{cita.proyecto.abreviatura && (
									<span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[9px] px-1 rounded font-bold uppercase tracking-wider">
										{cita.proyecto.abreviatura}
									</span>
								)}
							</span>
							{cita.lote && (
								<span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
									Lote:{" "}
									<span className="text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-500/10 px-1 py-0.5 rounded">
										Lte. {cita.lote.numero_lote}
									</span>
								</span>
							)}
						</div>
					</div>
				)}

				{/* Notas de Visita / Observaciones */}
				{cita.observaciones_visita && (
					<div className="p-2.5 bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-xl flex items-start gap-2 mt-0.5">
						<FiFileText
							size={12}
							className="text-gray-400 shrink-0 mt-0.5"
						/>
						<p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal line-clamp-2">
							{cita.observaciones_visita}
						</p>
					</div>
				)}
			</div>
			<div className="mt-auto pt-3.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between gap-4">
				<div className="flex items-center gap-2.5 min-w-0">
					<div className="w-6 h-6 rounded-full bg-linear-to-br from-cyan-400 to-teal-500 dark:from-cyan-500/40 dark:to-teal-500/20 text-white flex items-center justify-center shrink-0 shadow-sm border border-cyan-200/50 dark:border-cyan-800">
						<span className="text-[10px] font-bold uppercase">
							{avatarInitials}
						</span>
					</div>
					<div className="flex flex-col min-w-0 leading-tight">
						<span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
							Asesor Asignado
						</span>
						<span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
							{asesorNombre}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-1">
					{cita.puntuacion_cliente !== null &&
						cita.puntuacion_cliente !== undefined && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1 }}
								className="flex items-center gap-0.5 p-1 bg-amber-50 dark:bg-amber-950/10 rounded-lg border border-amber-100 dark:border-amber-900/30"
								title={`Calificación: ${cita.puntuacion_cliente} estrellas`}
							>
								{[...Array(5)].map((_, i) => (
									<motion.svg
										key={i}
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke={
											i < cita.puntuacion_cliente!
												? "#fbbf24"
												: "#9ca3af"
										}
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										initial={{ pathLength: 0 }}
										animate={{ pathLength: 1 }}
										transition={{
											delay: 0.1 + i * 0.05,
											duration: 0.4,
										}}
									>
										<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
									</motion.svg>
								))}
							</motion.div>
						)}
				</div>
			</div>
		</motion.div>
	);
};
