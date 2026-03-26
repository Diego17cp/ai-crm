import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { usePagination } from "@/shared/hooks";
import { salesService } from "../service/salesService";
import type { CollectionsBoardFilters } from "../types";

export type CollectionFilterTab = "vencidas" | "proximas" | "todas";

export const useCollections = () => {
    const { currentPage, perPage, goToPage, setPerPage } = usePagination({ 
        initialPage: 1, 
        initialPerPage: 10 
    });    
    const [currentTab, setCurrentTab] = useState<CollectionFilterTab>("vencidas");

    const filtersPayload: CollectionsBoardFilters = {
        page: currentPage,
        limit: perPage,
        filtro: currentTab,
        dias_proximas: currentTab === "proximas" ? 15 : undefined 
    };

    const query = useQuery({
        queryKey: [
            "cobranzas", 
            filtersPayload.page, 
            filtersPayload.limit, 
            filtersPayload.filtro, 
            filtersPayload.dias_proximas
        ],
        queryFn: () => salesService.getCollectionsBoard(filtersPayload),
        placeholderData: (prev) => prev,
    });

    const handleTabChange = (tab: CollectionFilterTab) => {
        setCurrentTab(tab);
        goToPage(1);
    };

    return {
        ...query,
        cobros: query.data?.data || [],
        meta: query.data?.meta,
        page: currentPage,
        limit: perPage,
        goToPage,
        setPerPage,
        currentTab,
        handleTabChange
    };
};