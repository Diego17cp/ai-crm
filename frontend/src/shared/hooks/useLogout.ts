import { useAuth } from "@/features/auth";
import { useState } from "react";

export const useLogout = () => {

    const { useLogoutMutation } = useAuth();

    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

    const openLogoutModal = () => setLogoutModalOpen(true);
    const closeLogoutModal = () => setLogoutModalOpen(false);

    const handleLogout = () => useLogoutMutation.mutate();

    return {
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
        handleLogout,
        isLoggingOut: useLogoutMutation.isPending
    }

}