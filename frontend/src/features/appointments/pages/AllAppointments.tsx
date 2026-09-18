import { motion, AnimatePresence } from "motion/react";
import {
	FiPlus,
	FiRefreshCw,
	FiCalendar,
	FiX,
	FiSearch,
	FiFilter,
	FiStar,
} from "react-icons/fi";
import { SearchableSelect, Select } from "dialca-ui";
import { useAppointments } from "../hooks/useAppointments";
import { useAppointmentsModals } from "../hooks/useAppointmentsModals";
import { AppointmentCard } from "../components/AppointmentCard";
import { AppointmentListSkeleton } from "../components/AppointmentListsSkeleton";
import { EmptyState, ErrorState, Pagination } from "@/shared/components";
import type { ApiError } from "@/core/types";
import { EditAppointmentModal } from "../components/EditAppointmentModal";
import { UpdateAppointmentStatusModal } from "../components/UpdateAppointmentStatusModal";
import { CreateAppointmentModal } from "../components/CreateAppointmentModal";
import { DeleteAppointmentModal } from "../components/DeleteAppointmentModal";
import { classes, options } from "@/shared/constants";
import type { Proyecto } from "../types";

const selectClasses = classes.select;
const searchableSelectClasses = classes.searchableSelect;
const estadoOpciones = options.estadoCita;

export const AllAppointments = () => {
	const {
		appointments,
		meta,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
		page,
		goToPage,
		searchTerm,
		handleSearch,
		clearSearch,
		filters,
		updateFilter,
		clearAllFilters,
		hasActiveFilters,
		projects,
		loadingProjects,
	} = useAppointments();

	const { openModal, selectedCita, activeModal, closeModal } =
		useAppointmentsModals();

	const proyectoOptions =
		projects?.map((p: Proyecto) => ({
			value: String(p.id),
			label: p.nombre,
		})) || [];

	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<FiCalendar className="text-teal-600 dark:text-teal-500" />{" "}
						Agenda y Citas
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Gestiona y programa las visitas y reuniones con tus
						clientes.
					</p>
				</motion.div>
				<div className="flex items-center gap-3">
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={() => openModal("create_appointment")}
						className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
					>
						<FiPlus size={18} />
						<span className="hidden sm:inline">Nueva Cita</span>
						<span className="sm:hidden">Nueva</span>
					</motion.button>
					<button
						onClick={() => refetch()}
						disabled={isFetching}
						title="Recargar datos"
						className="p-3 cursor-pointer shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50"
					>
						<FiRefreshCw
							className={isFetching ? "animate-spin" : ""}
							size={18}
						/>
					</button>
				</div>
			</div>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4"
			>
				<div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
					<div className="relative w-full flex items-center">
						<FiSearch
							className="absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none"
							size={18}
						/>
						<input
							type="text"
							placeholder="Buscar por cliente, asesor o DNI..."
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full pl-11 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none"
						/>
						{searchTerm && (
							<button
								onClick={clearSearch}
								className="absolute cursor-pointer right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-800 rounded-full"
							>
								<FiX size={16} />
							</button>
						)}
					</div>
					{hasActiveFilters && (
						<button
							onClick={clearAllFilters}
							className="flex cursor-pointer items-center gap-1.5 shrink-0 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium border border-transparent"
						>
							<FiFilter size={16} />
							<span className="hidden sm:inline">
								Limpiar filtros
							</span>
						</button>
					)}
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-gray-100 dark:border-gray-800/60 pt-3">
					<div className="flex flex-col z-30">
						<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">
							Proyecto Visitado
						</label>
						{loadingProjects ? (
							<div className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-400 text-xs animate-pulse">
								Cargando proyectos...
							</div>
						) : (
							<SearchableSelect
								options={proyectoOptions}
								value={
									filters.id_proyecto
										? String(filters.id_proyecto)
										: ""
								}
								onChange={(val) =>
									updateFilter(
										"id_proyecto",
										val ? Number(val) : undefined,
									)
								}
								placeholder="Todos los Proyectos"
								isClearable
								classes={searchableSelectClasses}
							/>
						)}
					</div>
					<div className="flex flex-col z-20">
						<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">
							Estado
						</label>
						<Select
							label=""
							options={estadoOpciones}
							value={filters.estado_cita || ""}
							onChange={(e) =>
								updateFilter("estado_cita", e.target.value)
							}
							placeholder="Todos los estados"
							classes={selectClasses}
						/>
					</div>
					<div className="flex flex-col z-10">
						<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">
							Rango de Fechas
						</label>
						<div className="flex items-center gap-1.5">
							<input
								type="date"
								value={filters.fecha_inicio || ""}
								onChange={(e) =>
									updateFilter("fecha_inicio", e.target.value)
								}
								title="Fecha Inicio"
								className="w-1/2 px-3 py-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-xs text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all scheme-light dark:scheme-dark"
							/>
							<span className="text-gray-400 text-xs">-</span>
							<input
								type="date"
								value={filters.fecha_fin || ""}
								onChange={(e) =>
									updateFilter("fecha_fin", e.target.value)
								}
								title="Fecha Fin"
								className="w-1/2 px-3 py-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-xs text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 transition-all scheme-light dark:scheme-dark"
							/>
						</div>
					</div>
					<div className="flex flex-col z-10">
						<label className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1 flex items-center justify-between">
							<span>Calificación</span>
							{filters.puntuacion && (
								<button
									onClick={() =>
										updateFilter("puntuacion", undefined)
									}
									className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer lowercase"
								>
									quitar
								</button>
							)}
						</label>
						<div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-transparent">
							{[1, 2, 3, 4, 5].map((star) => {
								const isSelected = filters.puntuacion === star;
								return (
									<button
										key={star}
										type="button"
										onClick={() =>
											updateFilter(
												"puntuacion",
												isSelected ? undefined : star,
											)
										}
										className={`flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-1 ${
											isSelected
												? "bg-amber-500 text-white shadow-sm shadow-amber-500/30 scale-105"
												: "text-gray-600 dark:text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
										}`}
										title={`${star} estrellas`}
									>
										<span>{star}</span>
										<FiStar
											size={11}
											className={
												isSelected
													? "fill-white text-white"
													: "fill-amber-400 text-amber-400"
											}
										/>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</motion.div>
			<div className="w-full flex-1">
				{isLoading ? (
					<AppointmentListSkeleton />
				) : isError ? (
					<ErrorState
						error={error as ApiError}
						onRetry={refetch}
						title="Error al cargar las citas"
					/>
				) : appointments.length === 0 ? (
					<EmptyState
						title="No hay citas encontradas"
						description={
							hasActiveFilters
								? "No se encontraron citas con los filtros seleccionados."
								: "No tienes citas programadas actualmente."
						}
					/>
				) : (
					<div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mt-6">
						<AnimatePresence mode="popLayout">
							{appointments.map((cita) => (
								<div
									key={cita.id}
									className="break-inside-avoid mb-4"
								>
									<AppointmentCard
										cita={cita}
										onEdit={() =>
											openModal("edit_appointment", cita)
										}
										onMarkAttended={() =>
											openModal("mark_attended", cita)
										}
										onMarkCanceled={() =>
											openModal("mark_canceled", cita)
										}
										onDelete={() =>
											openModal(
												"delete_appointment",
												cita,
											)
										}
									/>
								</div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
			{meta && meta.totalPages > 1 && (
				<Pagination
					currentPage={page}
					perPage={meta.limit}
					total={meta.total}
					totalPages={meta.totalPages}
					hasNext={meta.hasNextPage}
					hasPrev={meta.hasPreviousPage}
					onPageChange={goToPage}
					isLoading={isFetching}
				/>
			)}
			<CreateAppointmentModal
				isOpen={activeModal === "create_appointment"}
				onClose={closeModal}
			/>
			<EditAppointmentModal
				isOpen={activeModal === "edit_appointment"}
				cita={selectedCita}
				onClose={closeModal}
			/>
			<UpdateAppointmentStatusModal
				isOpen={
					activeModal === "mark_attended" ||
					activeModal === "mark_canceled"
				}
				cita={selectedCita}
				type={activeModal}
				onClose={closeModal}
			/>
			<DeleteAppointmentModal
				isOpen={activeModal === "delete_appointment"}
				cita={selectedCita}
				onClose={closeModal}
			/>
		</div>
	);
};
