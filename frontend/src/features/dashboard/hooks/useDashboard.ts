import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api";
import type { DashboardStats, AppointmentEvent } from "../types";

export interface DashboardAPIResponse {
    success: boolean;
    data: {
        stats: DashboardStats;
        events: AppointmentEvent[];
    };
}

export const useDashboard = () => {
    const query = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await apiClient.get<DashboardAPIResponse>("/dashboard");
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    return {
        stats: query.data?.stats ?? null,
        events: query.data?.events ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
};