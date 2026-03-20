import { IDashboardRepository } from "../ports/IDashboardRepository";
import { DashboardStats, AppointmentEvent } from "../../domain/Dashboard";

export class GetDashboardDataUseCase {
    constructor(private readonly dashboardRepo: IDashboardRepository) {}

    async execute(): Promise<{ stats: DashboardStats; events: AppointmentEvent[] }> {
        const stats = await this.dashboardRepo.getStats();
        const events = await this.dashboardRepo.getRecentEvents();
        
        return { stats, events };
    }
}