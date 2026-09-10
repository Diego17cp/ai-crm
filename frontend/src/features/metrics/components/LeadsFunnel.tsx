import type { LeadsByStateItem } from "../types";
import { motion } from "motion/react";
import {
	FiUserPlus,
	FiPhoneCall,
	FiCheckCircle,
	FiHeart,
	FiCalendar,
	FiDollarSign,
	FiAward,
	FiXCircle,
} from "react-icons/fi";

const ESTADO_CONFIG: Record<
	string,
	{ label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
	NUEVO: { label: "Nuevo", color: "bg-slate-400", icon: FiUserPlus },
	CONTACTADO: { label: "Contactado", color: "bg-blue-500", icon: FiPhoneCall },
	CALIFICADO: { label: "Calificado", color: "bg-indigo-500", icon: FiCheckCircle },
	INTERESADO: { label: "Interesado", color: "bg-purple-500", icon: FiHeart },
	CITA_AGENDADA: { label: "Cita Agendada", color: "bg-amber-500", icon: FiCalendar },
	NEGOCIACION: { label: "Negociación", color: "bg-orange-500", icon: FiDollarSign },
	GANADO: { label: "Ganado", color: "bg-teal-500", icon: FiAward },
	PERDIDO: { label: "Perdido", color: "bg-rose-500", icon: FiXCircle },
};

export const LeadsFunnel = ({ items }: { items: LeadsByStateItem[] }) => {
	const total = items.reduce((sum, i) => sum + i._count, 0);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
			className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-bold text-gray-900 dark:text-white">
					Funnel de Leads
				</h3>
				<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
					{total} Total
				</span>
			</div>

			<div className="space-y-3">
				{items.map((item, index) => {
					const config = ESTADO_CONFIG[item.estado] ?? {
						label: item.estado,
						color: "bg-gray-400",
						icon: FiUserPlus,
					};
					const Icon = config.icon;
					const percentage = total > 0 ? Math.round((item._count / total) * 100) : 0;

					return (
						<div key={item.estado} className="flex flex-col gap-1">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
									<Icon size={13} className="text-gray-400" />
									{config.label}
								</span>
								<div className="flex items-center gap-2">
									<span className="text-gray-400 text-[11px]">
										{percentage}%
									</span>
									<span className="font-bold text-gray-800 dark:text-gray-100">
										{item._count}
									</span>
								</div>
							</div>

							<div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${percentage}%` }}
									transition={{ duration: 0.8, delay: 0.1 * index, ease: "easeOut" }}
									className={`h-full rounded-full ${config.color}`}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};
