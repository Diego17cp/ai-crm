import { useEffect, useState } from "react";
import { LiveSidebar } from "../components/live/LiveSidebar";
import { QuoteReviewPanel } from "../components/live/QuoteReviewPanel";
import { useQuoteReview } from "../hooks/useQuoteReview";
import { useQuoteReviewStore } from "../store/useQuoteReviewStore";
import { useNavigate } from "react-router";

export const QuoteReview = () => {
	const navigate = useNavigate();
	const {
		isLoadingItems,
		handleTakeReview,
		handleApprove,
		handleReject,
		handleForceTakeChat,
	} = useQuoteReview();
	const [activeTab, setActiveTab] = useState<"queue" | "active">("queue");
	const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

	const myReviews = useQuoteReviewStore((state) => state.myReviews);
	const isMine = myReviews.some((q) => q.id === selectedQuoteId);

	useEffect(() => {
		if (selectedQuoteId !== null && isMine && activeTab === "queue") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveTab("active");
		}
	}, [selectedQuoteId, isMine, activeTab]);

	const handleChat = (chatId: string) => {
		handleForceTakeChat(chatId);
		navigate("/admin/chats/live", {
			state: {
				preselectedChatId: chatId,
			},
		});
	};

	return (
		<div className="flex h-[calc(100vh-115px)] w-full mb-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
			<LiveSidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				selectedQuoteId={selectedQuoteId}
				setSelectedQuoteId={setSelectedQuoteId}
				isLoading={isLoadingItems}
			/>
			<QuoteReviewPanel
				quoteId={selectedQuoteId}
				onTakeReview={handleTakeReview}
				onApprove={handleApprove}
				onReject={handleReject}
				onChat={handleChat}
				onClose={() => setSelectedQuoteId(null)}
			/>
		</div>
	);
};
