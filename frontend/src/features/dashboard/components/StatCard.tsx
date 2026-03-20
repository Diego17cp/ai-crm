import { useEffect, useRef } from "react";
import { motion, animate, useInView } from "motion/react";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string;
    delay?: number;
}

export const StatCard = ({ title, value, icon, colorClass, delay = 0 }: StatCardProps) => {
    const countRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView && countRef.current) {
            const controls = animate(0, value, {
                duration: 2,
                ease: "easeOut",
                onUpdate: (latest) => {
                    if (countRef.current) {
                        countRef.current.textContent = Math.round(latest).toLocaleString();
                    }
                },
            });
            return controls.stop;
        }
    }, [value, isInView]);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-all overflow-hidden relative"
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${colorClass.split(' ')[0]}`} />
            
            <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg ${colorClass}`}>
                {icon}
            </div>
            
            <div className="flex flex-col z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {title}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    <span ref={countRef}>0</span>
                </h3>
            </div>
        </motion.div>
    );
};