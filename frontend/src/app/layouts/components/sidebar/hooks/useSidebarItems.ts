import { useLiveChatStore } from "@/features/chat/store/useLiveChatStore";
import type { SidebarItem } from "../types";
import {
	FiPieChart,
	FiMessageSquare,
	FiList,
	FiEye,
	FiUsers,
	FiUserPlus,
	FiMap,
	FiBox,
	FiCalendar,
	FiDollarSign,
	FiSettings,
} from "react-icons/fi";
import { LuCalculator } from "react-icons/lu";

export const useSidebarItems = (): SidebarItem[] => {
	const unreadChatsCount = useLiveChatStore((state) => state.unreadChatIds.size);
	const hasChats = unreadChatsCount > 0;

	return [
		{
			text: "Dashboard",
			icon: FiPieChart,
			to: "/admin/dashboard",
		},
		{
			text: "Conversaciones",
			icon: FiMessageSquare,
			to: "/admin/chats",
			hasNotifications: hasChats,
			subItems: [
				{
					text: "Chat en Vivo",
					icon: FiMessageSquare,
					to: "/admin/chats/live",
					hasNotifications: hasChats,
					notificationsCount: unreadChatsCount,
				},
				{ text: "Historial", icon: FiList, to: "/admin/chats/history" },
			],
		},
		{
			text: "Cotizaciones",
			icon: LuCalculator,
			to: "/admin/quotes",
			subItems: [
				{
					text: "Revisar cotizaciones",
					icon: FiEye,
					to: "/admin/quotes/review",
				},
				{
					text: "Historial de cotizaciones",
					icon: FiList,
					to: "/admin/quotes/history",
				},
			],
		},
		{
			text: "Clientes",
			icon: FiUsers,
			to: "/admin/clients",
			subItems: [
				{
					text: "Leads (Prospectos)",
					icon: FiUserPlus,
					to: "/admin/clients/leads",
				},
				{
					text: "Clientes Activos",
					icon: FiUsers,
					to: "/admin/clients/active",
				},
			],
		},
		{
			text: "Inventario",
			icon: FiMap,
			to: "/admin/inventory",
			subItems: [
				{
					text: "Proyectos y Etapas",
					icon: FiMap,
					to: "/admin/inventory/projects",
				},
				{
					text: "Gestión de Lotes",
					icon: FiBox,
					to: "/admin/inventory/lots",
				},
			],
		},
		{
			text: "Citas y Agenda",
			icon: FiCalendar,
			to: "/admin/appointments",
		},
		{
			text: "Ventas y Pagos",
			icon: FiDollarSign,
			to: "/admin/sales",
			subItems: [
				{
					text: "Contratos de Venta",
					icon: FiDollarSign,
					to: "/admin/sales/contracts",
				},
				{
					text: "Control de Cuotas",
					icon: FiList,
					to: "/admin/sales/installments",
				},
			],
			restricted: true,
		},
		{
			text: "Administración",
			icon: FiSettings,
			to: "/admin/settings",
			restricted: true,
			subItems: [
				{
					text: "Usuarios",
					icon: FiUsers,
					to: "/admin/settings/users",
				},
			],
		},
	];
};
