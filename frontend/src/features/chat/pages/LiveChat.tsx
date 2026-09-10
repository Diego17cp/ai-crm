import { useEffect, useRef, useState } from "react";
import { LiveSidebar } from "../components/live/LiveSidebar";
import { LiveChatPanel } from "../components/live/LiveChatPanel";
import { useLiveChat } from "../hooks/useLiveChat";
import { useLiveChatStore } from "../store/useLiveChatStore";

export const LiveChat = () => {
	const [activeTab, setActiveTab] = useState<"queue" | "active">("queue");
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

	const selectedChatIdRef = useRef<string | null>(null);

	useEffect(() => {
		selectedChatIdRef.current = selectedChatId;
		if (selectedChatId) {
			useLiveChatStore.getState().markAsRead(selectedChatId);
		}
	}, [selectedChatId]);

	const { isLoadingItems, handleTakeChat, handleSendMessage, useUpdateChatStatusMutation } =
		useLiveChat(selectedChatIdRef);

	const reassignMutation = useUpdateChatStatusMutation(selectedChatId || "", "BOT")

	const handleTabChange = (tab: "queue" | "active") => {
		setSelectedChatId(null);
		setActiveTab(tab);
	};

	return (
		<div className="flex h-[calc(100vh-115px)] w-full mb-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
			<LiveSidebar
				activeTab={activeTab}
				setActiveTab={handleTabChange}
				selectedChatId={selectedChatId}
				setSelectedChatId={setSelectedChatId}
				isLoading={isLoadingItems}
			/>
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
			/>
		</div>
	);
};
