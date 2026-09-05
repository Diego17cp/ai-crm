import { create } from "zustand";
import type { QuoteQueueItem } from "../types/live";

interface QuoteReviewState {
	pendingQueue: QuoteQueueItem[];
	myReviews: QuoteQueueItem[];
	setInitialQueue: (quotes: QuoteQueueItem[]) => void;
	setInitialMyReviews: (quotes: QuoteQueueItem[]) => void;
	addQuoteToQueue: (quote: QuoteQueueItem) => void;
	removeQuoteFromQueue: (quoteId: number) => void;
	moveQuoteToMine: (quoteId: number) => void;
	resolveQuote: (quoteId: number) => void;
}

export const useQuoteReviewStore = create<QuoteReviewState>((set) => ({
	pendingQueue: [],
	myReviews: [],
	setInitialQueue: (quotes) => set({ pendingQueue: quotes }),
	setInitialMyReviews: (quotes) => set({ myReviews: quotes }),
	addQuoteToQueue: (quote) =>
		set((state) => {
			if (state.pendingQueue.some((q) => q.id === quote.id)) return state;
			return { pendingQueue: [quote, ...state.pendingQueue] };
		}),
	removeQuoteFromQueue: (quoteId) =>
		set((state) => ({
			pendingQueue: state.pendingQueue.filter((q) => q.id !== quoteId),
		})),
	moveQuoteToMine: (quoteId) =>
		set((state) => {
			const quote = state.pendingQueue.find((q) => q.id === quoteId);
			if (!quote) return state;
			const already = state.myReviews.some((q) => q.id === quoteId);
			return {
				pendingQueue: state.pendingQueue.filter(
					(q) => q.id !== quoteId,
				),
				myReviews: already
					? state.myReviews
					: [quote, ...state.myReviews],
			};
		}),
	resolveQuote: (quoteId) =>
		set((state) => ({
			myReviews: state.myReviews.filter((q) => q.id !== quoteId),
		})),
}));
