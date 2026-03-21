import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsService } from "../service/projects.service"
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useEtapas = () => {
    const queryClient = useQueryClient();
    const useCreateEtapaMutation = (id_proyecto: number, nombre: string) => useMutation({
        mutationFn: () => projectsService.createEtapa(id_proyecto, nombre),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Etapa creada exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al crear etapa";
            toast.error(message);
        }
    });
    const useEditEtapaMutation = (id_etapa: number, nombre: string) => useMutation({
        mutationFn: () => projectsService.editEtapa(id_etapa, nombre),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Etapa editada exitosamente");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al editar etapa";
            toast.error(message);
        }
    });
    const useToggleEtapaStatusMutation = (id_etapa: number) => useMutation({
        mutationFn: () => projectsService.toggleEtapaStatus(id_etapa),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Estado de etapa actualizado");
        },
        onError: (error: ApiError) => {
            const message = error?.response?.data?.message || "Error al actualizar estado de etapa";
            toast.error(message);
        }
    })
    return {
        useCreateEtapaMutation,
        useEditEtapaMutation,
        useToggleEtapaStatusMutation
    }
}