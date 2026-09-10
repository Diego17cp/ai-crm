import { DashboardStats, AppointmentEvent } from "../../domain/Dashboard";

export interface IDashboardRepository {
	getStats(idAsesor?: string): Promise<DashboardStats>;
	getRecentEvents(idAsesor?: string): Promise<AppointmentEvent[]>;
}
