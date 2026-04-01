import { motion } from "motion/react";
import { FiClock, FiInbox, FiMessageCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLiveChatStore } from "../../store/useLiveChatStore";
import { getRelativeWaitTime } from "../../utils/chatFormatters";

interface Props {
	activeTab: "queue" | "active";
	setActiveTab: (tab: "queue" | "active") => void;
	selectedChatId: string | null;
	setSelectedChatId: (id: string) => void;
    isLoading: boolean;
}

export const LiveSidebar = ({
	activeTab,
	setActiveTab,
	selectedChatId,
	setSelectedChatId,
    isLoading
}: Props) => {
	const queueQueue = useLiveChatStore((state) => state.queueQueue);
	const activeChats = useLiveChatStore((state) => state.activeChats);
	const data = activeTab === "queue" ? queueQueue : activeChats;

	return (
		<div className="w-80 lg:w-96 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full shrink-0">
			<div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
				<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
					Interacciones
				</h2>
				<div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl relative">
					{["queue", "active"].map((tab) => (
						<button
							key={tab}
							onClick={() =>
								setActiveTab(tab as "queue" | "active")
							}
							className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 rounded-lg transition-colors ${
								activeTab === tab
									? "text-teal-700 dark:text-teal-400"
									: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
							}`}
						>
							{tab === "queue" ? "En Espera" : "Mis Chats"}
							<span
								className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? "bg-teal-100 dark:bg-teal-800/60" : "bg-gray-200 dark:bg-gray-700"}`}
							>
								{tab === "queue"
									? queueQueue.length
									: activeChats.length}
							</span>
						</button>
					))}
					<motion.div
						className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-lg shadow-sm"
						animate={{
							left: activeTab === "queue" ? "4px" : "calc(50%)",
						}}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 30,
						}}
					/>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto main-scrollbar p-3 space-y-2">
				{isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800/40 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ): data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-80 px-4 mt-10">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-400">
                            <FiInbox size={24} />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {activeTab === "queue" ? "No hay chats en cola" : "No tienes chats activos"}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activeTab === "queue" 
                                ? "Los clientes que soliciten hablar con un asesor aparecerán aquí." 
                                : "Acepta un chat de la cola de espera para comenzar."}
                        </p>
                    </div>
                ) : data.map((chat) => (
					<div
						key={chat.id}
						onClick={() => setSelectedChatId(chat.id)}
						className={`p-3 rounded-2xl cursor-pointer border transition-all ${
							selectedChatId === chat.id
								? "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800/50"
								: "bg-white border-transparent hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
						}`}
					>
						<div className="flex justify-between items-start mb-1">
							<h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
								{chat.canal === "WHATSAPP" ? (
									<FaWhatsapp className="text-green-500" />
								) : (
									<FiMessageCircle className="text-blue-500" />
								)}
								{chat.nombre}
							</h4>
							<span className="text-[10px] flex items-center gap-1 text-gray-400 font-medium">
								{activeTab === "queue" ? (
									<>
										<FiClock />{" "}
										{getRelativeWaitTime(chat.createdAt)}
									</>
								) : (
									<span className="text-green-500">
										Activo
									</span>
								)}
							</span>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
							{chat.lastMessage}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};
