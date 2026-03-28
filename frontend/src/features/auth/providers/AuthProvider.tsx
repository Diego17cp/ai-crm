import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth.store"
import { apiClient, setupAuthInterceptor } from "@/core/api";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/core/types";
import { AppLoader } from "@/core/components";
import { useLocation, useNavigate } from "react-router";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, clearAuth, isAuthenticated } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        setupAuthInterceptor();
    }, []);
    const { data, isLoading, isError, isFetched } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const res = await apiClient.get("/auth/me");
            return res.data.data as User;
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 5, // 5 minutes
    });
    useEffect(() => {
        if (data) setUser(data);
        else if (!isLoading && isError) clearAuth();
    }, [data, isLoading, isError, setUser, clearAuth]);
    useEffect(() => {
        const handleLogoutEvt = () => navigate("/auth/login", { replace: true });
        window.addEventListener("auth:logout", handleLogoutEvt);
        return () => window.removeEventListener("auth:logout", handleLogoutEvt);
    }, [navigate]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!isLoading && isFetched) setIsInitialized(true);
    }, [isLoading, isFetched]);
    useEffect(() => {
        if (!isInitialized) return;
        const isAuthRoute = location.pathname.startsWith("/auth");
        const isAdminRoute = location.pathname.startsWith("/admin");
        if (!isAuthenticated && !isAuthRoute && isAdminRoute) {
            navigate("/auth/login", {
                replace: true,
                state: { from: location.pathname },
            });
        }
    }, [isInitialized, location.pathname]);
    if (isLoading || !isInitialized) return <AppLoader />;
    return <>{children}</>;
};