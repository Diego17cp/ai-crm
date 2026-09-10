import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from "recharts";
import { motion } from "motion/react";
import type { DailyMetrics } from "../types";

interface Props {
	data: DailyMetrics[];
	dataKey: keyof DailyMetrics;
	title: string;
	color?: string;
	delay?: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ value: number }>;
	label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-xl rounded-xl p-2.5 text-xs">
				<p className="text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
				<p className="text-sm font-bold text-gray-900 dark:text-white">
					{payload[0].value.toLocaleString("es-PE")}
				</p>
			</div>
		);
	}
	return null;
};

export const MetricsTrendChart = ({
	data,
	dataKey,
	title,
	color = "#0d9488",
	delay = 0,
}: Props) => {
	const chartData = data.map((d) => ({
		fecha: new Date(d.fecha).toLocaleDateString("es-PE", {
			day: "2-digit",
			month: "short",
		}),
		valor: d[dataKey] ?? 0,
	}));

	const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].valor : 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay, ease: "easeOut" }}
			className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:border-gray-200 dark:hover:border-gray-700/60 transition-colors"
		>
			<div className="flex items-center justify-between mb-4">
				<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
					{title}
				</p>
				<span
					className="text-xs font-bold px-2.5 py-0.5 rounded-full"
					style={{
						backgroundColor: `${color}18`,
						color: color,
					}}
				>
					Último: {latestValue}
				</span>
			</div>

			<ResponsiveContainer width="100%" height={180}>
				<AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
					<defs>
						<linearGradient
							id={`gradient-${dataKey}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop offset="0%" stopColor={color} stopOpacity={0.35} />
							<stop offset="95%" stopColor={color} stopOpacity={0.0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="currentColor"
						className="text-gray-100 dark:text-gray-800/60"
					/>
					<XAxis
						dataKey="fecha"
						tick={{ fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						stroke="#9ca3af"
					/>
					<YAxis
						tick={{ fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						stroke="#9ca3af"
						allowDecimals={false}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Area
						type="monotone"
						dataKey="valor"
						stroke={color}
						fill={`url(#gradient-${dataKey})`}
						strokeWidth={2.5}
						dot={{ fill: color, r: 3, strokeWidth: 0 }}
						activeDot={{ r: 5, strokeWidth: 0 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</motion.div>
	);
};
