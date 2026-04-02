import { useState } from "react";
import { LiveSidebar } from "../components/live/LiveSidebar";
import { LiveChatPanel } from "../components/live/LiveChatPanel";
import { useLiveChat } from "../hooks/useLiveChat";

export const LiveChat = () => {
    const { isLoadingItems, handleTakeChat, handleSendMessage } = useLiveChat();
    const [activeTab, setActiveTab] = useState<"queue" | "active">("queue");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    return (
        <div className="flex h-[calc(100vh-115px)] w-full mb-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <LiveSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                selectedChatId={selectedChatId}
                setSelectedChatId={setSelectedChatId}
                isLoading={isLoadingItems}
            />
            <LiveChatPanel 
                chatId={selectedChatId} 
                isQueue={activeTab === "queue"} 
                onTakeChat={handleTakeChat}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
};