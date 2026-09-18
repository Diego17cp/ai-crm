import { usePagination } from "@/shared/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
	CreateAppointmentPayload,
	EditAppointmentPayload,
	EstadoCita,
	FiltersState,
} from "../types";
import { appointmentsService } from "../service/appointmentsService";
import { apiClient } from "@/core/api";
import { toast } from "sonner";
import type { ApiError } from "@/core/types";

export const useAppointments = () => {
	const queryClient = useQueryClient();
	const { currentPage, perPage, goToPage, setPerPage } = usePagination({
		initialPage: 1,
		initialPerPage: 12,
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filters, setFilters] = useState({
		estado_cita: undefined as EstadoCita | undefined,
		fecha_inicio: undefined as string | undefined,
		fecha_fin: undefined as string | undefined,
		puntuacion: undefined as number | undefined,
		id_proyecto: undefined as number | undefined,
		id_usuario_responsable: undefined as string | undefined,
	});
	useEffect(() => {
		const handler = setTimeout(() => {
			if (debouncedSearch !== searchTerm) {
				setDebouncedSearch(searchTerm);
				goToPage(1);
			}
		}, 500);
		return () => clearTimeout(handler);
	}, [searchTerm, debouncedSearch, goToPage]);
	const handleSearch = (value: string) => setSearchTerm(value);

	const updateFilter = (
		key: keyof typeof filters,
		value: string | number | boolean | undefined,
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value !== undefined && value !== "" ? value : undefined,
		}));
		goToPage(1);
	};

	const clearSearch = () => {
		setSearchTerm("");
		setDebouncedSearch("");
		goToPage(1);
	};

	const clearAllFilters = () => {
		clearSearch();
		setFilters({
			estado_cita: undefined,
			fecha_inicio: undefined,
			fecha_fin: undefined,
			puntuacion: undefined,
			id_proyecto: undefined,
			id_usuario_responsable: undefined,
		});
		goToPage(1);
	};
	const hasActiveFilters = Boolean(
		debouncedSearch ||
		filters.estado_cita ||
		filters.fecha_inicio ||
		filters.fecha_fin ||
		filters.puntuacion ||
		filters.id_proyecto ||
		filters.id_usuario_responsable,
	);
	const filtersPayload: FiltersState = {
		page: currentPage,
		limit: perPage,
		q: debouncedSearch || undefined,
		...filters,
	};
	const query = useQuery({
		queryKey: [
			"appointments",
			filtersPayload.page,
			filtersPayload.limit,
			filtersPayload.q,
			filtersPayload.estado_cita,
			filtersPayload.fecha_inicio,
			filtersPayload.fecha_fin,
			filtersPayload.puntuacion,
			filtersPayload.id_proyecto,
			filtersPayload.id_usuario_responsable,
		],
		queryFn: () => appointmentsService.getAppointments(filtersPayload),
		placeholderData: (previousData) => previousData,
	});
	const projectsQuery = useQuery({
		queryKey: ["projects", "all"],
		queryFn: async () => {
			const response = await apiClient.get("/projects/all");
			return response.data.data;
		},
	});
	const useUpdateAppointmentMutation = (
		id: number,
		data: EditAppointmentPayload,
	) =>
		useMutation({
			mutationFn: () => appointmentsService.edit(id, data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["appointments"] });
				toast.success("Cita actualizada correctamente");
			},
			onError: (error: ApiError) => {
				const message =
					error.response?.data?.message ||
					"Error al actualizar la cita";
				toast.error(message);
			},
		});
	const useCreateAppointmentMutation = (data: CreateAppointmentPayload) =>
		useMutation({
			mutationFn: () => appointmentsService.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["appointments"] });
				toast.success("Cita creada correctamente");
			},
			onError: (error: ApiError) => {
				const message =
					error.response?.data?.message || "Error al crear la cita";
				toast.error(message);
			},
		});
	const useDeleteAppointmentMutation = (id: number) =>
		useMutation({
			mutationFn: () => appointmentsService.delete(id),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["appointments"] });
				toast.success("Cita eliminada correctamente");
			},
			onError: (error: ApiError) => {
				const message =
					error.response?.data?.message ||
					"Error al eliminar la cita";
				toast.error(message);
			},
		});

	return {
		...query,
		searchTerm,
		handleSearch,
		clearSearch,
		filters,
		updateFilter,
		clearAllFilters,
		hasActiveFilters,
		page: currentPage,
		limit: perPage,
		goToPage,
		setPerPage,
		appointments: query.data?.data || [],
		meta: query.data?.meta,
		projects: projectsQuery.data || [],
		loadingProjects: projectsQuery.isLoading,
		useUpdateAppointmentMutation,
		useCreateAppointmentMutation,
		useDeleteAppointmentMutation,
	};
};
