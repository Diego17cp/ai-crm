import { motion } from "motion/react";
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
	FiUserCheck,
} from "react-icons/fi";
import { useState } from "react";
import { useClickOutside } from "@/shared/hooks";
import type { Cita } from "../types";
import {
	getEstadoCitaColor,
	formatDate,
	formatTime,
} from "../utils/appointmentsFormatters";

interface AppointmentCardProps {
	cita: Cita;
	onEdit?: () => void;
	onMarkAttended?: () => void;
	onMarkCanceled?: () => void;
	onDelete?: () => void;
}

export const AppointmentCard = ({
	cita,
	onEdit,
	onMarkAttended,
	onMarkCanceled,
	onDelete,
}: AppointmentCardProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useClickOutside(() => setIsMenuOpen(false));

	const isProgramada = cita.estado_cita === "PROGRAMADA";
	const clienteNombre = cita.cliente
		? `${cita.cliente.nombres} ${cita.cliente.apellidos}`.trim()
		: "Cliente Desconocido";
	const asesorNombre = cita.asesor
		? `${cita.asesor.nombres} ${cita.asesor.apellidos}`.trim()
		: "Asesor no asignado";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -4 }}
			className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative
                ${isProgramada ? "border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-500/50" : "border-gray-200 dark:border-gray-800"}`}
		>
			<div className="flex justify-between items-start">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
						<FiCalendar className="text-gray-400" />
						{formatDate(cita.fecha_cita)}
					</div>
					{cita.hora_cita && (
						<div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
							<FiClock className="text-gray-400" />
							{formatTime(cita.hora_cita)} hrs
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span
						className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getEstadoCitaColor(cita.estado_cita)}`}
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
						{isMenuOpen && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20"
							>
								<button
									onClick={onEdit}
									className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors text-left"
								>
									<FiEdit2 size={14} className="shrink-0" />{" "}
									Editar Cita
								</button>
								{isProgramada && (
									<>
										<button
											onClick={onMarkAttended}
											className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-colors text-left font-medium"
										>
											<FiCheckCircle
												size={14}
												className="shrink-0"
											/>{" "}
											Marcar Atendida
										</button>
										<button
											onClick={onMarkCanceled}
											className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors text-left font-medium"
										>
											<FiXCircle
												size={14}
												className="shrink-0"
											/>{" "}
											Marcar Cancelada
										</button>
									</>
								)}
								<div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
								<button
									onClick={onDelete}
									className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-colors text-left"
								>
									<FiTrash2 size={14} className="shrink-0" />{" "}
									Eliminar
								</button>
							</motion.div>
						)}
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-2.5 mt-2">
				<div className="flex items-start gap-2 text-sm">
					<FiUser className="text-teal-500 mt-1 shrink-0" />
					<div>
						<p className="text-gray-900 dark:text-gray-100 font-medium leading-tight">
							{clienteNombre}
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Prospecto
						</p>
					</div>
				</div>
				{cita.proyecto && (
					<div className="flex items-start gap-2 text-sm">
						<FiMapPin className="text-teal-500 mt-1 shrink-0" />
						<div>
							<p className="text-gray-700 dark:text-gray-300 leading-tight">
								Proyecto{" "}
								<span className="font-semibold text-gray-900 dark:text-white">
									{cita.proyecto.nombre}
								</span>
							</p>
							{cita.lote && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
									Lote de interés:{" "}
									<span className="font-medium text-gray-700 dark:text-gray-300">
										Lte. {cita.lote.numero_lote}
									</span>
								</p>
							)}
						</div>
					</div>
				)}
			</div>
			<div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
				<div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
					<FiUserCheck size={12} />
				</div>
				<div className="flex flex-col min-w-0">
					<span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
						Toma la cita:
					</span>
					<span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
						{asesorNombre}
					</span>
				</div>
			</div>
		</motion.div>
	);
};
