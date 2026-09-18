import { useAuthStore } from "@/features/auth";
import { usePagination } from "@/shared/hooks";
import { useEffect, useState } from "react";
import type {
	CreateQuotePayload,
	EstadoCotizacion,
	GeneradoPor,
	QuoteFilters,
} from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotesService } from "../service/quotesService";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useQuotes = () => {
	const { currentPage, perPage, goToPage, setPerPage } = usePagination({
		initialPage: 1,
		initialPerPage: 12,
	});
	const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient()

	const userId = user?.id;

	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	useEffect(() => {
		const handler = setTimeout(() => {
			if (debouncedSearch !== searchTerm) {
				setDebouncedSearch(searchTerm);
				goToPage(1);
			}
		}, 500);
		return () => clearTimeout(handler);
	}, [searchTerm, debouncedSearch, goToPage]);
	const [filters, setFilters] = useState({
		state: undefined as EstadoCotizacion | undefined,
		generatedBy: undefined as GeneradoPor | undefined,
		date: undefined as string | undefined,
	});
	const handleSearch = (value: string) => setSearchTerm(value);
	const clearSearch = () => {
		setSearchTerm("");
		setDebouncedSearch("");
		goToPage(1);
	};
	const updateFilter = (
		key: keyof typeof filters,
		value: string | number | undefined,
	) => {
		setFilters((prev) => ({ ...prev, [key]: value || undefined }));
		goToPage(1);
	};
	const clearAllFilters = () => {
		setFilters({
			state: undefined,
			generatedBy: undefined,
			date: undefined,
		});
		goToPage(1);
	};
	const hasActiveFilters = Boolean(filters.state || filters.generatedBy || filters.date);

	const filtersPayload: QuoteFilters = {
		page: currentPage,
		limit: perPage,
		q: debouncedSearch || undefined,
		userId: !isAdmin ? userId : undefined,
		...filters,
	};

	const query = useQuery({
		queryKey: [
			"quotes",
			filtersPayload.q,
			filtersPayload.page,
			filtersPayload.limit,
			filtersPayload.state,
			filtersPayload.generatedBy,
			filtersPayload.userId,
			filtersPayload.date,
		],
		queryFn: () => quotesService.getAll(filtersPayload),
	});
	const useQuoteByIdQuery = (quoteId: number) =>
		useQuery({
			queryKey: ["quote", quoteId],
			queryFn: () => quotesService.getQuoteById(quoteId),
			enabled: Boolean(quoteId),
		});
	const useCreateQuoteMutation = (payload: CreateQuotePayload) =>
		useMutation({
			mutationFn: () => quotesService.createManual(payload),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["quotes"] });
				toast.success("Cotización creada exitosamente");
			},
			onError: (error: ApiError) => {
				const message =
					error.response?.data?.message || "Error al crear la cotización";
				toast.error(message);
			},
		});
	return {
		...query,
		quotes: query.data?.data || [],
		meta: query.data?.meta,
		filters,
		updateFilter,
		clearAllFilters,
		hasActiveFilters,
		page: currentPage,
		limit: perPage,
		goToPage,
		setPerPage,
		searchTerm,
		handleSearch,
		clearSearch,
		useQuoteByIdQuery,
    useCreateQuoteMutation
	};
};
