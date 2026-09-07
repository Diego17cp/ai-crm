import { useState } from "react";
import type { Quote } from "../types";

export type QuoteModalType = "none" | "view_details" | "create_quote";

export const useQuoteModals = () => {
	const [activeModal, setActiveModal] = useState<QuoteModalType>("none");
	const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

	const openModal = (type: QuoteModalType, quote?: Quote) => {
		if (quote) setSelectedQuote(quote);
		setActiveModal(type);
	};

	const closeModals = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedQuote(null);
		}, 300);
	};

	return {
		activeModal,
		selectedQuote,
		openModal,
		closeModals,
	};
};
