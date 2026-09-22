import { useEffect, useRef, useState } from "react";
import { LiveSidebar } from "../components/live/LiveSidebar";
import { LiveChatPanel } from "../components/live/LiveChatPanel";
import { useLiveChat } from "../hooks/useLiveChat";
import { useLiveChatStore } from "../store/useLiveChatStore";
import { useLocation, useNavigate } from "react-router";

export const LiveChat = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const preselectedChatId = (location.state as { preselectedChatId?: string | null })?.preselectedChatId;

	const [activeTab, setActiveTab] = useState<"queue" | "active">(preselectedChatId ? "active" : "queue");
	const [selectedChatId, setSelectedChatId] = useState<string | null>(preselectedChatId ?? null);

	const selectedChatIdRef = useRef<string | null>(null);

	useEffect(() => {
		selectedChatIdRef.current = selectedChatId;
		if (selectedChatId) {
			useLiveChatStore.getState().markAsRead(selectedChatId);
		}
	}, [selectedChatId]);

	useEffect(() => {
		if (preselectedChatId) {
			navigate(location.pathname, { replace: true, state: null })
		}
	}, [])

	const { isLoadingItems, handleTakeChat, handleSendMessage, useUpdateChatStatusMutation } =
		useLiveChat(selectedChatIdRef);

	const reassignMutation = useUpdateChatStatusMutation(selectedChatId || "", "BOT")

	const handleTabChange = (tab: "queue" | "active") => {
		setSelectedChatId(null);
		setActiveTab(tab);
	};

	const showPanelOnMobile = selectedChatId !== null;

	return (
		<div className="flex h-[calc(100vh-115px)] w-full mb-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
			<div className={`${showPanelOnMobile ? "hidden" : "flex"} md:flex w-full md:w-80 lg:w-96 flex-col`}>
				<LiveSidebar
					activeTab={activeTab}
					setActiveTab={handleTabChange}
					selectedChatId={selectedChatId}
					setSelectedChatId={setSelectedChatId}
					isLoading={isLoadingItems}
				/>
			</div>
			<div className={`${showPanelOnMobile ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}>
				<LiveChatPanel
					chatId={selectedChatId}
					isQueue={activeTab === "queue"}
					onTakeChat={handleTakeChat}
					onSendMessage={handleSendMessage}
					onCloseChat={() => setSelectedChatId(null)}
					onReassignBot={() => {
						reassignMutation.mutate(undefined, {
							onSuccess: () => setSelectedChatId(null)
						})
					}}
					onBack={() => setSelectedChatId(null)}
				/>
			</div>
		</div>
	);
};
