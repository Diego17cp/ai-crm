import { apiClient } from "@/core/api";
import type { ApiError, User } from "@/core/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const showError = (message: string, res: AxiosResponse) => {
        throw new Error(message || res.data.message || res.data.error || "An error occurred");
    }
    const showApiError = (error: ApiError, defaultMessage: string) => {
        console.error("[API Error]", error);
        let errorMessage = defaultMessage;
        if (error.response?.data?.error) errorMessage = error.response.data.error;
        else if (error.response?.data?.message) errorMessage = error.response.data.message;
        else if (error.message) errorMessage = error.message;
        toast.error(errorMessage);
    }
    const login = async (credentials: { email: string; password: string }): Promise<User> => {
        const res = await apiClient.post("/auth/login", {
            email: credentials.email,
            password_plain: credentials.password,
        });
        if (!res.data.success || !res.data.data?.user) showError("Login failed", res);
        return res.data.data.user;
    }
    const logout = async () => {
        const res = await apiClient.post("/auth/logout");
        if (!res.data.success) showError("Logout failed", res);
    }

    const useLoginMutation = useMutation({
        mutationFn: login,
        onSuccess: (user) => {
            useAuthStore.getState().setUser(user);
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            navigate("/admin/dashboard", { replace: true });
            toast.success("Bienvenido de nuevo!");
        },
        onError: (error: ApiError) => showApiError(error, "Login failed")
    });
    const useLogoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            useAuthStore.getState().clearAuth();
            queryClient.clear();
            navigate("/auth/login", { replace: true });
            toast.success("Cerraste sesión exitosamente");
        },
        onError: () => {
            useAuthStore.getState().clearAuth();
            queryClient.clear();
            toast.error("Cerraste sesión localmente, pero hubo un error al comunicarse con el servidor");
        },
    });

    return {
        useLoginMutation,
        useLogoutMutation,
    }
}