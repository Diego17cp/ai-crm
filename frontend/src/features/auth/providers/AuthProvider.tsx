import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store"
import { apiClient, setupAuthInterceptor } from "@/core/api";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/core/types";
import { AppLoader } from "@/core/components";
import { useNavigate } from "react-router";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, clearAuth, setInitialized } = useAuthStore();
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
        if (!isLoading && isFetched) setInitialized(true);
    }, [isLoading, isFetched, setInitialized]);
    
    if (isLoading) return <AppLoader />;
    return <>{children}</>;
};