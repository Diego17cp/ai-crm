import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsService } from "../service/projects.service"
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useManzanas = () => {
    const queryClient = useQueryClient();
    const useCreateManzana = (idEtapa: number, codigos: string[]) => useMutation({
        mutationFn: () => projectsService.createManzanas(idEtapa, codigos),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success(`Manzana${codigos.length > 1 ? 's' : ''} creada${codigos.length > 1 ? 's' : ''} exitosamente`);
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al crear manzanas";
            toast.error(message);
        }
    });
    const useEditManzana = (idManzana: number, codigo: string) => useMutation({
        mutationFn: () => projectsService.editManzana(idManzana, codigo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Manzana editada exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al editar manzana";
            toast.error(message);
        }
    });
    const useToggleManzanaStatus = (idManzana: number) => useMutation({
        mutationFn: () => projectsService.toggleManzanaStatus(idManzana),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Estado de manzana actualizado");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al actualizar estado de manzana";
            toast.error(message);
        }
    });
    return {
        useCreateManzana,
        useEditManzana,
        useToggleManzanaStatus
    }
}