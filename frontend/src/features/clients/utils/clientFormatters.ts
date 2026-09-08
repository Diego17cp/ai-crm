import {
	FiAlertCircle,
	FiCheckCircle,
	FiClock,
	FiDollarSign,
	FiFrown,
	FiHelpCircle,
	FiSmile,
	FiXCircle,
} from "react-icons/fi";

import type { Actitud, Solvencia } from "../types";

export const getSolvenciaColor = (solvencia?: Solvencia | null) => {
	switch (solvencia) {
		case "EXCELENTE":
		case "BUEN_PAGADOR":
			return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";

		case "PAGA_ATRASADO":
			return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";

		case "MOROSO":
		case "DESCARTADO":
			return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";

		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
	}
};

export const getSolvenciaTextColor = (solvencia?: Solvencia | null) => {
	switch (solvencia) {
		case "EXCELENTE":
		case "BUEN_PAGADOR":
			return "text-emerald-600 dark:text-emerald-400";

		case "PAGA_ATRASADO":
			return "text-amber-600 dark:text-amber-400";

		case "MOROSO":
		case "DESCARTADO":
			return "text-red-600 dark:text-red-400";

		default:
			return "text-gray-500 dark:text-gray-400";
	}
};

export const getSolvenciaIcon = (solvencia?: Solvencia | null) => {
	switch (solvencia) {
		case "EXCELENTE":
			return FiCheckCircle;

		case "BUEN_PAGADOR":
			return FiDollarSign;

		case "PAGA_ATRASADO":
			return FiClock;

		case "MOROSO":
			return FiAlertCircle;

		case "DESCARTADO":
			return FiXCircle;

		default:
			return FiHelpCircle;
	}
};

export const getActitudColor = (actitud?: Actitud | null) => {
	switch (actitud) {
		case "AMABLE":
			return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";

		case "DESCONFIADO":
			return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";

		case "QUEJOSO":
		case "ENOJADO":
			return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";

		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
	}
};

export const getActitudTextColor = (actitud?: Actitud | null) => {
	switch (actitud) {
		case "AMABLE":
			return "text-blue-600 dark:text-blue-400";

		case "DESCONFIADO":
			return "text-amber-600 dark:text-amber-400";

		case "QUEJOSO":
		case "ENOJADO":
			return "text-orange-600 dark:text-orange-400";

		default:
			return "text-gray-500 dark:text-gray-400";
	}
};

export const getActitudIcon = (actitud?: Actitud | null) => {
	switch (actitud) {
		case "AMABLE":
			return FiSmile;

		case "DESCONFIADO":
			return FiHelpCircle;

		case "QUEJOSO":
			return FiFrown;

		case "ENOJADO":
			return FiAlertCircle;

		default:
			return FiHelpCircle;
	}
};
