import { 
    FiPieChart, 
    FiMessageSquare, 
    FiUsers, 
    FiMap, 
    FiCalendar, 
    FiDollarSign, 
    FiSettings,
    FiList,
    FiUserPlus,
    FiBox
} from "react-icons/fi";
import type { SidebarItem } from "../types";

export const SIDEBAR_ITEMS: SidebarItem[] = [
    { 
        text: "Dashboard", 
        icon: FiPieChart, 
        to: "/admin/dashboard" 
    },
    {
        text: "Conversaciones",
        icon: FiMessageSquare,
        to: "/admin/chats",
        subItems: [
            { text: "Chat en Vivo", icon: FiMessageSquare, to: "/admin/chats/live" },
            { text: "Historial", icon: FiList, to: "/admin/chats/history" },
        ],
    },
    {
        text: "Clientes",
        icon: FiUsers,
        to: "/admin/clients",
        subItems: [
            { text: "Leads (Prospectos)", icon: FiUserPlus, to: "/admin/clients/leads" },
            { text: "Clientes Activos", icon: FiUsers, to: "/admin/clients/active" },
        ],
    },
    {
        text: "Inventario",
        icon: FiMap,
        to: "/admin/inventory",
        subItems: [
            { text: "Proyectos y Etapas", icon: FiMap, to: "/admin/inventory/projects" },
            { text: "Gestión de Lotes", icon: FiBox, to: "/admin/inventory/lots" },
        ],
    },
    { 
        text: "Citas y Agenda", 
        icon: FiCalendar, 
        to: "/admin/appointments" 
    },
    {
        text: "Ventas y Pagos",
        icon: FiDollarSign,
        to: "/admin/sales",
        subItems: [
            { text: "Contratos de Venta", icon: FiDollarSign, to: "/admin/sales/contracts" },
            { text: "Control de Cuotas", icon: FiList, to: "/admin/sales/installments" },
        ],
    },
    {
        text: "Administración",
        icon: FiSettings,
        to: "/admin/settings",
        restricted: true,
        subItems: [
            { text: "Usuarios", icon: FiUsers, to: "/admin/settings/users" },
        ],
    },
];