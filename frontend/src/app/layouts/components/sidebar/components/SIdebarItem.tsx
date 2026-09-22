import { NavLink } from "react-router";
import { useSidebar } from "../hooks/useSidebar";

interface Props {
	text: string;
	icon: React.ReactNode;
	to: string;
	isCompact?: boolean;
	hasNotifications?: boolean;
	notificationsCount?: number;
}

export const SidebarItem = ({
	text,
	icon,
	to,
	isCompact = false,
	hasNotifications,
	notificationsCount = 0,
}: Props) => {
	const { closeSidebar } = useSidebar();

	return (
		<NavLink
			to={to}
			onClick={() => {
				if (window.innerWidth < 768) closeSidebar();
			}}
			className={({ isActive }) => `
				flex items-center py-2.5 px-3 rounded-xl transition-all duration-200 group
				${isCompact ? "justify-center" : ""}
				${
					isActive
						? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-semibold shadow-sm"
						: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
				}
      `}
			title={isCompact ? text : undefined}
		>
			<div
				className={`relative flex items-center justify-center ${isCompact ? "text-xl" : "text-lg w-6"}`}
			>
				{icon}
				{isCompact && hasNotifications && (
					<span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
				)}
			</div>

			{!isCompact && (
				<div className="ml-3 flex-1 flex items-center justify-between min-w-0">
					<span className="truncate">{text}</span>
					{notificationsCount > 0 && (
						<span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full shrink-0">
							{notificationsCount}
						</span>
					)}
				</div>
			)}
		</NavLink>
	);
};
