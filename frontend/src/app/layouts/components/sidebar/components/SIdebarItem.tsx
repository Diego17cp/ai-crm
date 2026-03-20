import { NavLink } from "react-router";
import { useSidebar } from "../hooks/useSidebar";

interface Props {
    text: string;
    icon: React.ReactNode;
    to: string;
    isCompact?: boolean;
}

export const SidebarItem = ({ text, icon, to, isCompact = false }: Props) => {
    const { closeSidebar } = useSidebar();

    return (
        <NavLink
            to={to}
            onClick={() => {
                if (window.innerWidth < 768) closeSidebar();
            }}
            className={({ isActive }) => `
                flex items-center py-2.5 px-3 rounded-xl transition-all duration-200 group
                ${isCompact ? "justify-center" : ""}
                ${isActive 
                    ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"}
            `}
            title={isCompact ? text : undefined}
        >
            <div className={`flex items-center justify-center ${isCompact ? "text-xl" : "text-lg w-6"}`}>
                {icon}
            </div>
            
            {!isCompact && (
                <span className="ml-3 truncate">{text}</span>
            )}
        </NavLink>
    );
};