export const getBadgeStyle = (estado: string) => {
    switch (estado.toUpperCase()) {
        case "ACTIVO":
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
        case "INACTIVO":
            return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
};