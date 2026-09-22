import { FiAward, FiStar, FiChevronRight } from "react-icons/fi";
import type { LeaderboardItem } from "../types";
import { formatCurrency } from "@/features/sales/utils/salesFormatters";
import { formatDuration, formatScore } from "../utils/metricsFormatters";
import { useNavigate } from "react-router";
import { GiTrophy } from "react-icons/gi";
import { motion } from "motion/react";

export const AdvisorLeaderboard = ({ items }: { items: LeaderboardItem[] }) => {
	const navigate = useNavigate();
	const ordered = [...items].sort(
		(a, b) => b.monto_vendido - a.monto_vendido,
	);

	const renderRankBadge = (index: number) => {
		if (index === 0) {
			return (
				<span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 shadow-xs">
					<GiTrophy size={14} />
				</span>
			);
		}
		if (index === 1) {
			return (
				<span className="inline-flex items-center justify-center size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs">
					2
				</span>
			);
		}
		if (index === 2) {
			return (
				<span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-900/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-500 font-bold text-xs">
					3
				</span>
			);
		}
		return (
			<span className="inline-flex items-center justify-center size-6 text-gray-400 font-medium text-xs">
				{index + 1}
			</span>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
					<FiAward className="text-amber-500" size={18} /> Ranking de
					Asesores
				</h3>
				<span className="text-xs text-gray-400 font-medium">
					{ordered.length} asesores activos
				</span>
			</div>

			{ordered.length === 0 ? (
				<p className="text-sm text-gray-400 text-center py-8">
					Sin datos registrados en este rango.
				</p>
			) : (
				<div className="overflow-x-auto main-scrollbar">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
								<th className="pb-3 font-medium">#</th>
								<th className="pb-3 font-medium">Asesor</th>
								<th className="pb-3 font-medium text-right">
									Ventas
								</th>
								<th className="pb-3 font-medium text-right">
									Monto
								</th>
								<th className="pb-3 font-medium text-right">
									T. Resp.
								</th>
								<th className="pb-3 font-medium text-right">
									Rating
								</th>
								<th className="pb-3 w-6"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
							{ordered.map((item, i) => (
								<tr
									key={item.id_usuario}
									onClick={() =>
										navigate(
											`/admin/metrics/${item.id_usuario}`,
											{
												state: { nombre: item.nombre },
											},
										)
									}
									className="group cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
								>
									<td className="py-3 w-8">
										{renderRankBadge(i)}
									</td>
									<td className="py-3 font-medium text-gray-800 dark:text-gray-200">
										<div className="flex items-center gap-2">
											<div className="size-7 rounded-full bg-linear-to-tr from-pink-500 to-pink-400 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
												{item.nombre
													.charAt(0)
													.toUpperCase()}
											</div>
											<span className="truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
												{item.nombre}
											</span>
										</div>
									</td>
									<td className="py-3 text-right">
										<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
											{item.ventas_cerradas}
										</span>
									</td>
									<td className="py-3 text-right font-bold text-pink-600 dark:text-pink-400">
										{formatCurrency(item.monto_vendido)}
									</td>
									<td className="py-3 text-right text-xs text-gray-500 dark:text-gray-400">
										{formatDuration(
											item.tiempo_respuesta_prom_seg,
										)}
									</td>
									<td className="py-3 text-right">
										<span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
											<FiStar
												size={12}
												className="fill-amber-400"
											/>
											{formatScore(
												item.puntuacion_atencion_prom,
											)}
										</span>
									</td>
									<td className="py-3 text-right text-gray-300 dark:text-gray-600 group-hover:text-pink-500 transition-colors">
										<FiChevronRight size={16} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</motion.div>
	);
};
