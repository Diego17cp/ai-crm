import { Outlet } from "react-router";
import { Sidebar } from "./components/sidebar/Sidebar";
import { Header } from "./components/header/Header";
import { useLogout } from "@/shared/hooks";
import { LogoutModal } from "@/shared/components";

export const AuthLayout = () => {
	const {
		isLogoutModalOpen,
		openLogoutModal,
		closeLogoutModal,
		handleLogout,
        isLoggingOut
	} = useLogout();
	return (
		<div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100 transition-colors">
			<Sidebar onLogoutClick={openLogoutModal} />
			<div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
				<Header onLogoutClick={openLogoutModal} />
				<main className="flex-1 overflow-y-auto main-scrollbar p-4 md:p-6 relative">
					<Outlet />
				</main>
			</div>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={closeLogoutModal}
                onConfirm={handleLogout}
                isLoading={isLoggingOut}
            />
		</div>
	);
};
