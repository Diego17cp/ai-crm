import { apiClient } from "./apiClient";
import { useAuthStore } from "@/features/auth";

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

let hasRedirected = false;
let interceptorsSetUp = false;

const processQueue = (error: Error | null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

const handleLogout = () => {
    if (!window.location.pathname.startsWith("/admin")) return;
    if (hasRedirected) return;
    
    hasRedirected = true;
    console.log("[Auth interceptor]: Clearing auth and redirecting to login");
    
    useAuthStore.getState().clearAuth();
    
    window.dispatchEvent(new CustomEvent("auth:logout"));
    
    setTimeout(() => hasRedirected = false, 1000);
};

export const setupAuthInterceptor = () => {
    if (interceptorsSetUp) return;
    interceptorsSetUp = true;
    apiClient.interceptors.response.use(
        (response) => response,
        async (err) => {
            const originalRequest = err.config;
            
            console.log("[Auth interceptor]: Triggered with error:", {
                status: err.response?.status,
                url: originalRequest?.url,
                isRefreshing,
                retry: originalRequest._retry
            });
            
            if (
                err.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes("/auth/refresh") &&
                !originalRequest.url?.includes("/auth/login")
            ) {
                if (isRefreshing) {
                    console.log("Already refreshing, queuing request");
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(() => apiClient(originalRequest))
                        .catch((error) => Promise.reject(error));
                }
                
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    console.log("Attempting token refresh");
                    await apiClient.post("/auth/refresh", {});
                    console.log("Token refresh successful");
                    processQueue(null);
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    console.log("Token refresh failed:", refreshError);
                    processQueue(new Error("Token refresh failed"));
                    handleLogout();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            return Promise.reject(err);
        },
    );
};