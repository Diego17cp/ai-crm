import { FiSearch, FiMoon, FiSun, FiLogOut } from "react-icons/fi";
import { useTheme } from "@/shared/hooks/useTheme";

interface Props {
    onLogoutClick: () => void;
}

export const Header = ({ onLogoutClick }: Props) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 shrink-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 z-10 sticky top-0 transition-colors">            
            <div className="flex items-center text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg w-48 md:w-80 lg:w-96 transition-colors">
                <FiSearch className="mr-2 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
                />
            </div>                    
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">                
                <button 
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:ring-2 focus:ring-teal-500 outline-none"
                >
                    {theme === "dark" ? (
                        <FiSun className="text-xl text-amber-400" />
                    ) : (
                        <FiMoon className="text-xl" />
                    )}
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button 
                    onClick={onLogoutClick}
                    title="Cerrar sesión"
                    className="p-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors flex items-center gap-2 outline-none group"
                >
                    <FiLogOut className="text-xl group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden md:inline text-sm font-medium">Salir</span>
                </button>

            </div>
        </header>
    );
};