export interface DashboardStats {
    leads: number;
    clients: number;
    soldLots: number;
    availableLots: number;
}

export interface AppointmentEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    backgroundColor?: string;
}