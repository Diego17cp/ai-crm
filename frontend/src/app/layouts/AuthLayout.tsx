import { Outlet } from "react-router";
import { Sidebar } from "./components/sidebar/Sidebar";
import { Header } from "./components/header/Header";

export const AuthLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100 transition-colors">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header />
                <main className="flex-1 overflow-y-auto main-scrollbar p-4 md:p-6 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};