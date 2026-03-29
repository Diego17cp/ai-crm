import { usePagination } from "@/shared/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { CanalContacto, ChatFilters, EstadoChat } from "../types";
import { chatsService } from "../service/chatsService";

export const useChats = () => {
    const { currentPage, perPage, goToPage, setPerPage } = usePagination({
        initialPage: 1,
        initialPerPage: 12
    })
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
        estado: undefined as EstadoChat | undefined,
        canal: undefined as CanalContacto | undefined,
    });
    const handleSearch = (value: string) => setSearchTerm(value);
    const clearSearch = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        goToPage(1);
    }
    const updateFilter = (key: keyof typeof filters, value: string | number | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
        goToPage(1);
    };
    const clearAllFilters = () => {
        setFilters({
            estado: undefined,
            canal: undefined,
        });
        goToPage(1);
    };
    const hasActiveFilters = Boolean(filters.estado || filters.canal);

    const filtersPayload: ChatFilters = {
        page: currentPage,
        limit: perPage,
        q: debouncedSearch || undefined,
        ...filters
    };
    const query = useQuery({
        queryKey: [
            "chats",
            filtersPayload.q,
            filtersPayload.page,
            filtersPayload.limit,
            filtersPayload.estado,
            filtersPayload.canal
        ],
        queryFn: () => chatsService.getChats(filtersPayload),
    });
    const useChatByIdQuery = (chatId: string) => useQuery({
        queryKey: ["chat", chatId],
        queryFn: () => chatsService.getChatById(chatId),
        enabled: Boolean(chatId),
    })

    return {
        ...query,
        chats: query.data?.data || [],
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
        useChatByIdQuery
    }
}