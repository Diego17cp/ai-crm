import { useQuery } from "@tanstack/react-query";
import { projectsService } from "../service/projects.service";
import { usePagination } from "@/shared/hooks/usePagination";
import { useState, useEffect } from "react";

export const useProjects = () => {
    const { currentPage, perPage, goToPage, setPerPage } = usePagination({
        initialPage: 1,
        initialPerPage: 10
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            goToPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, goToPage]);

    const handleSearch = (value: string) => setSearchTerm(value);
    const clearSearch = () => setSearchTerm("");

    const query = useQuery({
        queryKey: ["projects", currentPage, perPage, debouncedSearch],
        queryFn: () => projectsService.getAll(currentPage, perPage, debouncedSearch || undefined),
        placeholderData: (previousData) => previousData
    });

    return {
        ...query,
        page: currentPage,
        limit: perPage,
        goToPage,
        setPerPage,
        searchTerm,
        handleSearch,
        clearSearch,
        projects: query.data?.data || [],
        meta: query.data?.meta
    }
}