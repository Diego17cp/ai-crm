import { FiUsers, FiCalendar, FiFileText, FiDollarSign, FiClock, FiStar, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { useAuthStore } from "@/features/auth";
import { useDateRangeLast7Days } from "../hooks/useDateRange";
import { useAdvisorMetrics } from "../hooks/useMetrics";
import { MetricCard } from "../components/MetricCard";
import { MetricsTrendChart } from "../components/MetricsTrendChart";
import { formatCurrency } from "@/features/sales/utils/salesFormatters";
import { formatDuration, formatPercent, formatScore } from "../utils/metricsFormatters";
import { Link, useLocation, useParams } from "react-router";
import { motion } from "motion/react"
import { GrPieChart } from "react-icons/gr";

export const AdvisorMetrics = () => {
	const { user } = useAuthStore();
	const { idUser, idUsuario: idUsuarioParam } = useParams<{
		idUser?: string;
		idUsuario?: string;
	}>();
	const idParam = idUser || idUsuarioParam
	const location = useLocation()
	const  nameFromNav = (location.state as { nombre?: string } | null)?.nombre;

	const isAdmin = user?.rol === "ADMIN"
	const idUsuario = idParam && isAdmin ? idParam : (user?.id ?? "")
	const seingOther = isAdmin && Boolean(idParam) && idParam !== user.id

	const { desde, hasta } = useDateRangeLast7Days();
	const { data, isLoading, isError, refetch, isRefetching } = useAdvisorMetrics(idUsuario, desde, hasta);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="h-20 bg-gray-100 dark:bg-gray-800/40 rounded-2xl animate-pulse" />
				))}
			</div>
		);
	}

	if (isError || !data) {
		return <p className="text-red-500 text-sm">Error al cargar tus métricas.</p>;
	}

	const { resumen, serie_diaria } = data;

	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
				{seingOther && (
					<Link
						to="/admin/dashboard"
						className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 mb-2 transition-colors"
					>
						<FiArrowLeft size={14} /> Volver al ranking
					</Link>
				)}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<GrPieChart className="text-teal-600 dark:text-teal-500" />{" "}
						{seingOther ? `Desempeño de ${nameFromNav ?? "asesor"}` : "Mi Desempeño"}
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Últimos 7 días
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
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard icon={FiUsers} label="Clientes atendidos" value={resumen.clientes_atendidos} accent="blue" />
				<MetricCard icon={FiCalendar} label="Citas agendadas" value={resumen.citas_agendadas} accent="teal" />
				<MetricCard icon={FiFileText} label="Cotizaciones generadas" value={resumen.cotizaciones_generadas} accent="purple" />
				<MetricCard icon={FiDollarSign} label="Ventas cerradas" value={resumen.ventas_cerradas} accent="amber" />
				<MetricCard icon={FiDollarSign} label="Monto vendido" value={formatCurrency(resumen.monto_vendido)} accent="teal" />
				<MetricCard icon={FiUsers} label="Tasa de cierre" value={formatPercent(resumen.tasa_cierre)} accent="blue" />
				<MetricCard icon={FiClock} label="Tiempo resp. promedio" value={formatDuration(resumen.tiempo_respuesta_prom_seg)} accent="purple" />
				<MetricCard icon={FiStar} label="Calificación promedio" value={formatScore(resumen.puntuacion_atencion_prom)} accent="amber" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<MetricsTrendChart data={serie_diaria} dataKey="clientes_atendidos" title="Clientes atendidos por día" color="#2563eb" />
				<MetricsTrendChart data={serie_diaria} dataKey="ventas_cerradas" title="Ventas cerradas por día" color="#d97706" />
				<MetricsTrendChart data={serie_diaria} dataKey="tiempo_respuesta_prom_seg" title="Tiempo de respuesta (seg)" color="#7c3aed" />
				<MetricsTrendChart data={serie_diaria} dataKey="puntuacion_atencion_prom" title="Calificación de atención" color="#0d9488" />
			</div>
		</div>
	);
};