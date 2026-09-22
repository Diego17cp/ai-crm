import type { IconType } from "react-icons";
import { motion } from "motion/react";

interface Props {
	icon: IconType;
	label: string;
	value: string | number;
	accent?: "pink" | "blue" | "purple" | "amber" | "emerald" | "rose";
	delay?: number;
	subtext?: string;
}

const ACCENT_STYLES = {
	pink: {
		bg: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
		glow: "bg-pink-500",
		border: "hover:border-pink-300 dark:hover:border-pink-700/50",
	},
	blue: {
		bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
		glow: "bg-blue-500",
		border: "hover:border-blue-300 dark:hover:border-blue-700/50",
	},
	purple: {
		bg: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
		glow: "bg-purple-500",
		border: "hover:border-purple-300 dark:hover:border-purple-700/50",
	},
	amber: {
		bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
		glow: "bg-amber-500",
		border: "hover:border-amber-300 dark:hover:border-amber-700/50",
	},
	emerald: {
		bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
		glow: "bg-emerald-500",
		border: "hover:border-emerald-300 dark:hover:border-emerald-700/50",
	},
	rose: {
		bg: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
		glow: "bg-rose-500",
		border: "hover:border-rose-300 dark:hover:border-rose-700/50",
	},
};

export const MetricCard = ({
	icon: Icon,
	label,
	value,
	accent = "pink",
	delay = 0,
	subtext,
}: Props) => {
	const style = ACCENT_STYLES[accent] ?? ACCENT_STYLES.pink;

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay, ease: "easeOut" }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className={`relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-xs overflow-hidden transition-all duration-300 ${style.border}`}
		>
			<div
				className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none ${style.glow}`}
			/>
			<div
				className={`p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105 ${style.bg}`}
			>
				<Icon size={20} />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
					{label}
				</p>
				<p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight truncate">
					{value}
				</p>
				{subtext && (
					<span className="text-[11px] text-gray-400 dark:text-gray-500 block truncate">
						{subtext}
					</span>
				)}
			</div>
		</motion.div>
	);
};
