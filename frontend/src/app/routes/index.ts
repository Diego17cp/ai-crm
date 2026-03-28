import { lazyPage } from "./lazyFactory";

export const ChatbotPage = lazyPage(() => import("@/features/chat/pages/Chat"), "Chat");
export const LoginPage = lazyPage(() => import("@/features/login/pages/Login"), "Login");
export const DashboardPage = lazyPage(() => import("@/features/dashboard/pages/Dashboard"), "Dashboard");
export const AllProjectsPage = lazyPage(() => import("@/features/projects/pages/AllProjects"), "AllProjects");
export const AllLotsPage = lazyPage(() => import("@/features/lots/pages/AllLots"), "AllLots");
export const AllLeadsPage = lazyPage(() => import("@/features/leads/pages/AllLeads"), "AllLeads");
export const AllAppointmentsPage = lazyPage(() => import("@/features/appointments/pages/AllAppointments"), "AllAppointments");
export const AllSalesPage = lazyPage(() => import("@/features/sales/pages/AllSales"), "AllSales");
export const SaleDetailPage = lazyPage(() => import("@/features/sales/pages/Sale"), "SaleDetail");
export const CollectionsPage = lazyPage(() => import("@/features/sales/pages/Collections"), "Collections");
export const AllCustomersPage = lazyPage(() => import("@/features/clients/pages/AllCustomers"), "AllCustomers");
export const AllUsersPage = lazyPage(() => import("@/features/users/pages/AllUsers"), "AllUsers");