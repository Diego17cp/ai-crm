import { DashboardStats, AppointmentEvent } from "../../domain/Dashboard";

export interface IDashboardRepository {
    getStats(): Promise<DashboardStats>;
    getRecentEvents(): Promise<AppointmentEvent[]>;
}