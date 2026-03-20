import { useState } from "react";
import { useSidebar } from "../hooks/useSidebar";
import { FiChevronRight } from "react-icons/fi";
import { NavLink } from "react-router";
import type { SidebarItem as SidebarItemType } from "../types";
import { isSuperAdmin } from "@/core/utils/users";
import { useAuthStore } from "@/features/auth";
import { motion, AnimatePresence } from "motion/react";

interface Props {
    icon: React.ReactNode;
    text: string;
    subItems: SidebarItemType[];
    isCompact?: boolean;
    onClick?: () => void;
}

export const SidebarSubmenu = ({
    icon,
    text,
    subItems,
    isCompact = false,
    onClick,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { closeSidebar } = useSidebar();
    const { user } = useAuthStore();

    const toggleMenu = () => {
        if (onClick) onClick();
        if (!isCompact) setIsOpen(!isOpen);
    };

    return (
        <div className="flex flex-col">
            <button
                onClick={toggleMenu}
                className={`flex items-center py-2.5 px-3 rounded-xl transition-all duration-200 group w-full text-left
                    ${isCompact ? "justify-center" : ""} 
                    text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200
                    ${isOpen && !isCompact ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                `}
                title={isCompact ? text : undefined}
            >
                <div className={`flex items-center justify-center ${isCompact ? "text-xl" : "text-lg w-6"}`}>
                    {icon}
                </div>
                
                {!isCompact && (
                    <>
                        <span className="ml-3 font-medium flex-1 truncate">{text}</span>
                        <FiChevronRight className={`text-sm transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
                    </>
                )}
            </button>
            <AnimatePresence>
                {!isCompact && isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pl-9 pr-2 py-1 flex flex-col gap-1 relative mt-1">
                            <div className="absolute left-6 top-0 bottom-2 w-px bg-gray-200 dark:bg-gray-700"></div>
                            {subItems.map((item) => {
                                const showItem = !item.restricted || isSuperAdmin(user?.rol || "");
                                if (!showItem) return null;
                                return (
                                    <NavLink
                                        key={item.text}
                                        to={item.to}
                                        end
                                        onClick={() => {
                                            if (window.innerWidth < 768) closeSidebar();
                                        }}
                                        className={({ isActive }) => `
                                            flex items-center py-2 px-3 rounded-lg transition-all duration-200 text-sm relative
                                            ${isActive 
                                                ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium" 
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                                        `}
                                    >
                                        <div className={`absolute -left-3.5 size-1.25 rounded-full transition-all duration-200 ${location.pathname === item.to ? "bg-teal-500" : "bg-transparent scale-0"}`} />
                                        <div className="text-base mr-2">
                                            {item.icon && <item.icon />}
                                        </div>
                                        <span className="truncate">{item.text}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};