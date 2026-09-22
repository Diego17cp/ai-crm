import { motion } from "motion/react";
import { FiFileText, FiUser } from "react-icons/fi";
import { VscRobot } from "react-icons/vsc";
import type { Quote } from "../types";
import { formatQuoteDate } from "../utils/quoteFormatters";

interface QuoteListItemProps {
	quote: Quote;
	onClick: () => void;
}

const ESTADO_CONFIG: Record<
	Quote["estado"],
	{ label: string; colorClass: string }
> = {
	BORRADOR: {
		label: "Borrador",
		colorClass:
			"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50",
	},
	EMITIDA: {
		label: "Emitida",
		colorClass:
			"bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/50",
	},
	ACEPTADA: {
		label: "Aceptada",
		colorClass:
			"bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50",
	},
	RECHAZADA: {
		label: "Rechazada",
		colorClass:
			"bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50",
	},
	VENCIDA: {
		label: "Vencida",
		colorClass:
			"bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
	},
};

export const QuoteListItem = ({ quote, onClick }: QuoteListItemProps) => {
	const { label, colorClass } = ESTADO_CONFIG[quote.estado];

	const clienteName = quote.cliente
		? `${quote.cliente.nombres || ""} ${quote.cliente.apellidos || ""}`.trim() ||
			"Cliente Anónimo"
		: "Cliente Anónimo";

	const responsable = quote.revisor
		? {
				nombre: `${quote.revisor.nombres} ${quote.revisor.apellidos ?? ""}`.trim(),
				esRevision: true,
			}
		: quote.asesor
			? {
					nombre: `${quote.asesor.nombres} ${quote.asesor.apellidos ?? ""}`.trim(),
					esRevision: false,
				}
			: null;

	const precioFormateado = new Intl.NumberFormat("es-PE", {
		style: "currency",
		currency: "PEN",
	}).format(quote.precio_final);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.98 }}
			onClick={onClick}
			className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-pink-500/30 hover:bg-pink-50/30 dark:hover:bg-pink-900/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
		>
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-xl shrink-0 bg-gray-50 dark:bg-gray-900 text-pink-600 dark:text-pink-500 group-hover:scale-110 transition-transform">
					<FiFileText className="w-6 h-6" />
				</div>
				<div>
					<h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
						{quote.codigo}
						<span
							className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
						>
							{label}
						</span>
						{quote.generado_por === "BOT" && (
							<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
								<VscRobot size={11} /> Bot
							</span>
						)}
					</h3>
					<div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
						<span>{clienteName}</span>
						{responsable && (
							<span className="flex items-center gap-1.5">
								<FiUser className="w-3.5 h-3.5" />
								{responsable.nombre}
								{responsable.esRevision && (
									<span className="opacity-60">(revisó)</span>
								)}
							</span>
						)}
					</div>
				</div>
			</div>
			<div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:gap-1">
				<span className="text-sm font-bold text-gray-900 dark:text-white">
					{precioFormateado}
				</span>
				<span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
					{formatQuoteDate(quote.created_at)}
				</span>
			</div>
		</motion.div>
	);
};
