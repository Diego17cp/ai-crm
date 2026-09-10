import { useDashboard } from "../hooks/useDashboard";
import { StatCard } from "../components/StatCard";
import { AppointmentsCalendar } from "../components/AppointmentsCalendar";
import { FiUsers, FiUserCheck, FiHome, FiMapPin, FiRefreshCw } from "react-icons/fi";
import { motion } from "motion/react";
import { useDateRangeLast7Days } from "@/features/metrics/hooks/useDateRange";
import { useAdminOverview } from "@/features/metrics/hooks/useMetrics";
import { AdvisorLeaderboard } from "@/features/metrics/components/AdvisorLeaderboard";
import { LeadsFunnel } from "@/features/metrics/components/LeadsFunnel";
import { useAuthStore } from "@/features/auth";
import { RiDashboardHorizontalLine } from "react-icons/ri";

export const Dashboard = () => {
	const { user } = useAuthStore();
	const { stats, events, isLoading, isRefetching, refetch } = useDashboard();
	const { desde, hasta } = useDateRangeLast7Days();
	const { data: overview } = useAdminOverview(desde, hasta);
	const isAdmin = user?.rol === "ADMIN";

	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<RiDashboardHorizontalLine  className="text-teal-600 dark:text-teal-500" />{" "}
						Panel General
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Monitorea el rendimiento del CRM, leads, citas, asesores, métricas y más en tiempo real.
					</p>
				</motion.div>
				<div className="flex items-center gap-3">
					<button
						onClick={() => refetch()}
						disabled={isRefetching || isLoading}
						title="Recargar datos"
						className="p-3 cursor-pointer shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50 flex items-center gap-2"
					>
						<FiRefreshCw
							className={isRefetching ? "animate-spin" : ""}
							size={18}
						/>
						<span className="hidden sm:inline text-sm font-medium">
							Recargar
						</span>
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				<StatCard
					title="Leads Totales"
					value={stats?.leads || 0}
					icon={<FiUsers />}
					colorClass="bg-teal-500"
					delay={0.1}
				/>
				<StatCard
					title="Clientes Activos"
					value={stats?.clients || 0}
					icon={<FiUserCheck />}
					colorClass="bg-blue-500"
					delay={0.2}
				/>
				<StatCard
					title="Lotes Vendidos"
					value={stats?.soldLots || 0}
					icon={<FiHome />}
					colorClass="bg-amber-500"
					delay={0.3}
				/>
				<StatCard
					title="Lotes Disponibles"
					value={stats?.availableLots || 0}
					icon={<FiMapPin />}
					colorClass="bg-emerald-500"
					delay={0.4}
				/>
			</div>
			<div className="mt-4">
				<AppointmentsCalendar events={events} isLoading={isLoading} />
			</div>
			{isAdmin && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 items-start">
					<AdvisorLeaderboard items={overview?.leaderboard ?? []} />
					<LeadsFunnel items={overview?.leads_por_estado ?? []} />
				</div>
			)}
		</div>
	);
};
