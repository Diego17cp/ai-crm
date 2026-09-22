import { motion } from "motion/react";
import { FiMessageSquare, FiActivity, FiUserCheck } from "react-icons/fi";

export type ChatDetailTab = "mensajes" | "eventos" | "asignaciones";

interface Props {
	activeTab: ChatDetailTab;
	setActiveTab: (tab: ChatDetailTab) => void;
}

const TABS: {
	key: ChatDetailTab;
	label: string;
	icon: typeof FiMessageSquare;
}[] = [
	{ key: "mensajes", label: "Mensajes", icon: FiMessageSquare },
	{ key: "eventos", label: "Eventos", icon: FiActivity },
	{ key: "asignaciones", label: "Asignaciones", icon: FiUserCheck },
];

export const ChatDetailTabs = ({ activeTab, setActiveTab }: Props) => {
	return (
		<div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl relative">
			{TABS.map(({ key, label, icon: Icon }) => (
				<button
					key={key}
					onClick={() => setActiveTab(key)}
					className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium z-10 rounded-lg transition-colors ${
						activeTab === key
							? "text-pink-700 dark:text-pink-400"
							: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
					}`}
				>
					<Icon size={15} />
					{label}
				</button>
			))}
			<motion.div
				className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
				animate={{
					left: `${(TABS.findIndex((t) => t.key === activeTab) / TABS.length) * 100}%`,
					width: `${100 / TABS.length}%`,
				}}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				style={{ zIndex: 0 }}
			/>
		</div>
	);
};
