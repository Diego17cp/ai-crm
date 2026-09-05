import { useEffect, useState } from "react";
import { LiveSidebar } from "../components/live/LiveSidebar";
import { QuoteReviewPanel } from "../components/live/QuoteReviewPanel";
import { useQuoteReview } from "../hooks/useQuoteReview";
import { useQuoteReviewStore } from "../store/useQuoteReviewStore";

export const QuoteReview = () => {
	const { isLoadingItems, handleTakeReview, handleApprove, handleReject } = useQuoteReview();
	const [activeTab, setActiveTab] = useState<"queue" | "active">("queue");
	const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

  const pendingQueue = useQuoteReviewStore((state) => state.pendingQueue);
	const myReviews = useQuoteReviewStore((state) => state.myReviews);
  const isQueue = pendingQueue.some((q) => q.id === selectedQuoteId);
	const isMine = myReviews.some((q) => q.id === selectedQuoteId);

  useEffect(() => {
		if (selectedQuoteId !== null && isMine && activeTab === "queue") {
			setActiveTab("active");
		}
	}, [selectedQuoteId, isMine, activeTab]);

	useEffect(() => {
		if (selectedQuoteId !== null && !isQueue && !isMine) {
			setSelectedQuoteId(null);
		}
	}, [selectedQuoteId, isQueue, isMine]);

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
				isQueue={isQueue}
				onTakeReview={handleTakeReview}
				onApprove={handleApprove}
				onReject={handleReject}
			/>
		</div>
	);
};
