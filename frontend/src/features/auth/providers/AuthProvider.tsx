import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store"
import { apiClient, setupAuthInterceptor } from "@/core/api";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/core/types";
import { AppLoader } from "@/core/components";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, clearAuth } = useAuthStore();
    useEffect(() => {
        setupAuthInterceptor();
    }, []);
    const { data, isLoading, isError } = useQuery({
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
    if (isLoading) return <AppLoader />;
    return <>{children}</>;
};