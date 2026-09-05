import { motion } from "motion/react";
import { FiClock, FiFileText, FiInbox } from "react-icons/fi";
import { useQuoteReviewStore } from "../../store/useQuoteReviewStore";
import { getRelativeWaitTime } from "@/features/chat/utils/chatFormatters";

interface Props {
	activeTab: "queue" | "active";
	setActiveTab: (tab: "queue" | "active") => void;
	selectedQuoteId: number | null;
	setSelectedQuoteId: (id: number) => void;
	isLoading: boolean;
}

export const LiveSidebar = ({
	activeTab,
	setActiveTab,
	selectedQuoteId,
	setSelectedQuoteId,
	isLoading,
}: Props) => {
	const pendingQueue = useQuoteReviewStore((state) => state.pendingQueue);
	const myReviews = useQuoteReviewStore((state) => state.myReviews);
	const data = activeTab === "queue" ? pendingQueue : myReviews;

	return (
		<div className="w-80 lg:w-96 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full shrink-0">
			<div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
				<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
					Solicitudes de revisión
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
							{tab === "queue" ? "En Espera" : "En Revisión"}
							<span
								className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? "bg-teal-100 dark:bg-teal-800/60" : "bg-gray-200 dark:bg-gray-700"}`}
							>
								{tab === "queue" ? pendingQueue.length : myReviews.length}
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
							<div
								key={i}
								className="h-16 bg-gray-100 dark:bg-gray-800/40 rounded-2xl animate-pulse"
							/>
						))}
					</div>
				) : data.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center opacity-80 px-4 mt-10">
						<div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-400">
							<FiInbox size={24} />
						</div>
						<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
							{activeTab === "queue"
								? "No hay solicitudes de revision en cola"
								: "No tienes revisiones en curso"}
						</h4>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{activeTab === "queue"
								? "Las cotizaciones que el sistema haya marcado para revisión aparecerán aquí."
								: "Acepta una solicitud de revisión para comenzar."}
						</p>
					</div>
				) : (
					data.map((quote) => (
						<div
							key={quote.id}
							onClick={() => setSelectedQuoteId(quote.id)}
							className={`p-3 rounded-2xl cursor-pointer border transition-all ${
								selectedQuoteId === quote.id
									? "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800/50"
									: "bg-white border-transparent hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
							}`}
						>
							<div className="flex justify-between items-start mb-1">
								<h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
									<FiFileText className="text-teal-500" />
									{quote.codigo}
								</h4>
								{activeTab === "queue" && (
									<span className="text-[10px] flex items-center gap-1 text-gray-400 font-medium">
										<FiClock /> {getRelativeWaitTime(quote.createdAt)}
									</span>
								)}
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
								{quote.cliente} · {quote.lote}
							</p>
						</div>
					))
				)}
			</div>
		</div>
	);
};
