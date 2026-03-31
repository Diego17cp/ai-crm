import { useSidebar } from "./hooks/useSidebar";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { FiMenu, FiChevronLeft, FiLogOut } from "react-icons/fi";
import { SIDEBAR_ITEMS } from "./constants/sidebarItems";
import { SidebarItem, SidebarSubmenu } from "./components";
import { isSuperAdmin } from "@/core/utils/users";
import { useAuthStore } from "@/features/auth";
import { NOMBRE_EMPRESA } from "@/shared/constants";

interface Props {
    onLogoutClick: () => void;
}

export const Sidebar = ({
    onLogoutClick
}: Props) => {
    const { user } = useAuthStore();
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>
            <aside
                className={`fixed md:relative top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-50 transition-all duration-300 ease-out shadow-xl md:shadow-none
                    ${isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-20"}`
                }
            >
                <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
                    <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isOpen && "md:w-0"}`}>
                        <Link to="/admin/dashboard" className="shrink-0 flex items-center justify-center w-8 h-8 bg-linear-to-tr from-teal-600 to-teal-400 rounded-lg shadow-sm shadow-teal-500/30">
                            <span className="text-white text-xs font-black">AK</span>
                        </Link>
                        <span className="font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap tracking-tight">
                            {NOMBRE_EMPRESA} Admin
                        </span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors shrink-0 mx-auto md:mx-0"
                        aria-label="Toggle Sidebar"
                    >
                        {isOpen ? <FiChevronLeft className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden main-scrollbar py-4 px-3 flex flex-col gap-1.5">
                    {SIDEBAR_ITEMS.map((item) => {
                        const showItem = !item.restricted || isSuperAdmin(user?.rol || "");
                        if (!showItem) return null;
                        if (item.subItems) {
                            return (
                                <SidebarSubmenu
                                    key={item.text}
                                    icon={<item.icon />}
                                    text={item.text}
                                    subItems={item.subItems}
                                    isCompact={!isOpen}
                                    onClick={!isOpen ? toggleSidebar : undefined}
                                />
                            );
                        }
                        return (
                            <SidebarItem
                                key={item.text}
                                text={item.text}
                                icon={<item.icon />}
                                to={item.to}
                                isCompact={!isOpen}
                            />
                        );
                    })}
                </div>
                <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-3">
                    <div className={`flex items-center gap-3 ${isOpen ? "px-2 py-2" : "justify-center align-middle py-2"} rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group relative`}>                        
                        <div className="shrink-0 w-10 h-10 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <img src="/profile-pic.webp" alt="Profile Picture" className="object-cover" />
                        </div>
                        {isOpen && (
                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                <div className="flex flex-col truncate">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                        {user?.nombres}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user?.email}
                                    </span>
                                </div>
                                <button 
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                                    title="Cerrar sesión"
                                    onClick={onLogoutClick}
                                >
                                    <FiLogOut className="text-lg" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};