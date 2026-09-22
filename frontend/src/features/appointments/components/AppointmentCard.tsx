import { motion, AnimatePresence } from "motion/react";
import {
	FiMoreVertical,
	FiMapPin,
	FiEdit2,
	FiCheckCircle,
	FiXCircle,
	FiTrash2,
	FiFileText,
	FiPhone,
	FiStar,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { useClickOutside } from "@/shared/hooks";
import type { Cita } from "../types";
import { formatTime } from "../utils/appointmentsFormatters";
import { useAuthStore } from "@/features/auth";

interface AppointmentCardProps {
	cita: Cita;
	onEdit?: () => void;
	onMarkAttended?: () => void;
	onMarkCanceled?: () => void;
	onDelete?: () => void;
}

const STATUS_META: Record<
	string,
	{ stub: string; dot: string; text: string; label: string }
> = {
	PROGRAMADA: {
		stub: "bg-blue-600",
		dot: "bg-blue-500",
		text: "text-blue-700 dark:text-blue-400",
		label: "Programada",
	},
	ATENDIDA: {
		stub: "bg-pink-600",
		dot: "bg-pink-500",
		text: "text-pink-700 dark:text-pink-400",
		label: "Atendida",
	},
	CANCELADA: {
		stub: "bg-gray-400 dark:bg-gray-600",
		dot: "bg-gray-400",
		text: "text-gray-500 dark:text-gray-400",
		label: "Cancelada",
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
	const isAtendida = cita.estado_cita === "ATENDIDA";
	const status = STATUS_META[cita.estado_cita] ?? STATUS_META.PROGRAMADA;

	const clienteNombre = cita.persona
		? `${cita.persona.nombres} ${cita.persona.apellidos ?? ""}`.trim()
		: "Cliente desconocido";
	const asesorNombre = cita.asesor
		? `${cita.asesor.nombres} ${cita.asesor.apellidos}`.trim()
		: "Sin asesor asignado";
	const avatarInitials = cita.asesor
		? `${cita.asesor.nombres?.[0] ?? ""}${cita.asesor.apellidos?.[0] ?? ""}`.toUpperCase()
		: "?";
	const telefonoPrincipal = cita.persona?.telefonos?.[0];

	const fecha = new Date(cita.fecha_cita);
	const dia = fecha.getUTCDate();
	const mes = fecha
		.toLocaleDateString("es-PE", { month: "short", timeZone: "UTC" })
		.replace(".", "");
	const diaSemana = fecha
		.toLocaleDateString("es-PE", { weekday: "short", timeZone: "UTC" })
		.replace(".", "");

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -3 }}
			transition={{ type: "spring", stiffness: 350, damping: 28 }}
			className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
		>
			<div
				className={`w-20 sm:w-22 shrink-0 flex flex-col rounded-l-2xl items-center justify-center gap-0.5 py-5 ${status.stub} text-white`}
			>
				<span className="text-[11px] font-medium opacity-80">
					{diaSemana}
				</span>
				<span className="text-3xl font-bold leading-none tabular-nums">
					{dia}
				</span>
				<span className="text-xs font-medium opacity-90">{mes}</span>
				{cita.hora_cita && (
					<span className="mt-2 text-[11px] font-semibold bg-white/15 rounded-full px-2 py-0.5">
						{formatTime(cita.hora_cita)}
					</span>
				)}
			</div>

			<div className="border-l border-dashed border-gray-200 dark:border-gray-700" />

			<div className="flex-1 min-w-0 p-5 flex flex-col gap-3">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="font-semibold text-gray-900 dark:text-white truncate">
							{clienteNombre}
						</p>
						<div className="flex items-center gap-2 mt-0.5">
							<span
								className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.text}`}
							>
								<span
									className={`size-1.5 rounded-full ${status.dot}`}
								/>
								{status.label}
							</span>
							{isAtendida && cita.puntuacion_cliente != null && (
								<span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-500">
									<FiStar
										size={11}
										className="fill-current"
									/>
									{cita.puntuacion_cliente}/5
								</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-1.5 shrink-0">
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
								onClick={(e) => e.stopPropagation()}
								title={`Contactar por ${telefonoPrincipal.tipo === "WHATSAPP" ? "WhatsApp" : "teléfono"}`}
								className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
									telefonoPrincipal.tipo === "WHATSAPP"
										? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-900/50"
										: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
								}`}
							>
								{telefonoPrincipal.tipo === "WHATSAPP" ? (
									<FaWhatsapp size={14} />
								) : (
									<FiPhone size={14} />
								)}
							</a>
						)}

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
										}}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{
											opacity: 0,
											scale: 0.95,
											y: -4,
										}}
										className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20 py-1"
									>
										<button
											onClick={() => {
												setIsMenuOpen(false);
												onEdit?.();
											}}
											className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors text-left"
										>
											<FiEdit2
												size={14}
												className="shrink-0"
											/>{" "}
											Editar cita
										</button>
										{isProgramada && (
											<>
												<button
													onClick={() => {
														setIsMenuOpen(false);
														onMarkAttended?.();
													}}
													className="w-full flex items-center gap-2 px-4 py-2 text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 cursor-pointer transition-colors text-left font-medium"
												>
													<FiCheckCircle
														size={14}
														className="shrink-0"
													/>{" "}
													Marcar atendida
												</button>
												<button
													onClick={() => {
														setIsMenuOpen(false);
														onMarkCanceled?.();
													}}
													className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors text-left font-medium"
												>
													<FiXCircle
														size={14}
														className="shrink-0"
													/>{" "}
													Marcar cancelada
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
													className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-colors text-left"
												>
													<FiTrash2
														size={14}
														className="shrink-0"
													/>{" "}
													Eliminar
												</button>
											</>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				{cita.proyecto && (
					<div className="flex items-start gap-2 text-sm">
						<FiMapPin
							className="text-pink-500 mt-0.5 shrink-0"
							size={15}
						/>
						<div className="min-w-0">
							<p className="text-gray-700 dark:text-gray-300 leading-snug flex items-center gap-1.5 flex-wrap">
								{cita.proyecto.nombre}
								{cita.proyecto.abreviatura && (
									<span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] px-1.5 rounded font-medium">
										{cita.proyecto.abreviatura}
									</span>
								)}
								{cita.lote && (
									<span className="text-gray-500 dark:text-gray-400">
										· Lote {cita.lote.numero_lote}
									</span>
								)}
							</p>
							{cita.proyecto.ubicacion && (
								<p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
									{cita.proyecto.ubicacion}
								</p>
							)}
						</div>
					</div>
				)}

				{cita.observaciones_visita && (
					<div className="flex items-start gap-2 text-xs bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
						<FiFileText
							className="text-gray-400 mt-0.5 shrink-0"
							size={12}
						/>
						<p className="text-gray-600 dark:text-gray-400 leading-snug line-clamp-2">
							{cita.observaciones_visita}
						</p>
					</div>
				)}

				<div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
					<div className="size-6 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0">
						<span className="text-[10px] font-bold">
							{avatarInitials}
						</span>
					</div>
					<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
						Asignado a{" "}
						<span className="font-medium text-gray-700 dark:text-gray-300">
							{asesorNombre}
						</span>
					</p>
				</div>
			</div>
		</motion.div>
	);
};
