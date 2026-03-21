import { useState, useCallback } from "react";

interface UsePaginationOptions {
    initialPage?: number;
    initialPerPage?: number;
}

export interface PaginationState {
    currentPage: number;
    perPage: number;
}

export const usePagination = ({
    initialPage = 1,
    initialPerPage = 10,
}: UsePaginationOptions = {}) => {
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: initialPage,
        perPage: initialPerPage,
    });

    const goToPage = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, []);

    const setPerPage = useCallback((perPage: number) => {
        setPagination({ currentPage: 1, perPage });
    }, []);

    const reset = useCallback(() => {
        setPagination({ currentPage: initialPage, perPage: initialPerPage });
    }, [initialPage, initialPerPage]);

    return {
        ...pagination,
        goToPage,
        setPerPage,
        reset,
    };
};