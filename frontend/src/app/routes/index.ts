import { lazyPage } from "./lazyFactory";

export const ChatbotPage = lazyPage(() => import("@/features/chat/pages/Chat"), "Chat");
export const LoginPage = lazyPage(() => import("@/features/login/pages/Login"), "Login");
export const DashboardPage = lazyPage(() => import("@/features/dashboard/pages/Dashboard"), "Dashboard");
export const AllProjectsPage = lazyPage(() => import("@/features/projects/pages/AllProjects"), "AllProjects");