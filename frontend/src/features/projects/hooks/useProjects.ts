import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "../service/projects.service";
import { usePagination } from "@/shared/hooks/usePagination";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useProjects = () => {
    const queryClient = useQueryClient();

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

    const useCreateProjectMutation = (idUbigeo: string, nombre: string, abreviatura?: string, ubicacion?: string, descripcion?: string) => useMutation({
        mutationFn: () => projectsService.createProject(idUbigeo, nombre, abreviatura, ubicacion, descripcion),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Proyecto creado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al editar etapa";
            toast.error(message);
        }
    });
    const useEditProjectMutation = (id: number, idUbigeo: string, nombre: string, abreviatura?: string, ubicacion?: string, descripcion?: string) => useMutation({
        mutationFn: () => projectsService.editProject(id, idUbigeo, nombre, abreviatura, ubicacion, descripcion),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Proyecto editado exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al editar proyecto";
            toast.error(message);
        }
    });
    const useToggleProjectStatusMutation = (id: number) => useMutation({
        mutationFn: () => projectsService.toggleProjectStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Estado del proyecto actualizado");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al actualizar estado del proyecto";
            toast.error(message);
        }
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
        meta: query.data?.meta,
        useCreateProjectMutation,
        useEditProjectMutation,
        useToggleProjectStatusMutation
    }
}