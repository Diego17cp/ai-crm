import { useDashboard } from "../hooks/useDashboard";
import { StatCard } from "../components/StatCard";
import { AppointmentsCalendar } from "../components/AppointmentsCalendar";
import { FiUsers, FiUserCheck, FiHome, FiMapPin } from "react-icons/fi";
import { motion } from "motion/react";

export const Dashboard = () => {
    const { stats, events, isLoading } = useDashboard();

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
            {/* Encabezado */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Panel General
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Monitorea el rendimiento del CRM y la agenda en tiempo real.
                </p>
            </motion.div>

            {/* Grid de Estadísticas */}
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

            {/* Sección de Calendario */}
            <div className="mt-4">
                <AppointmentsCalendar events={events} isLoading={isLoading} />
            </div>
        </div>
    );
};