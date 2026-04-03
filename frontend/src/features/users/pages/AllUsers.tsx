import { motion, AnimatePresence } from "motion/react";
import { FiUsers, FiPlus, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import type { ApiError } from "@/core/types";
import { UsersListSkeleton } from "../components/UsersListSkeleton";
import { UserListItem } from "../components/UserListItem";
import { useUserModals } from "../hooks/useUsersModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { EditUserModal } from "../components/EditUserModal";
import { DeleteUserModal } from "../components/DeleteUserModal";
import { classes } from "@/shared/constants";

const selectClasses = classes.searchableSelect;

const estadoOptions = [
	{ value: "ACTIVO", label: "Activos" },
	{ value: "INACTIVO", label: "Inactivos" },
];

export const AllUsers = () => {
	const {
		users,
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
	} = useUsers();

	const { roles } = useRoles();
	const rolesOptions = roles.map((r) => ({
		value: String(r.id),
		label: r.nombre,
	}));

	const { activeModal, selectedUser, openModal, closeModal } =
		useUserModals();

	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<FiUsers className="text-teal-600 dark:text-teal-500" />
						Gestión de Usuarios
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Administra los accesos, roles y estado de los
						colaboradores.
					</p>
				</motion.div>

				<div className="flex items-center gap-3">
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={() => openModal("create_user")}
						className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
					>
						<FiPlus size={18} />
						<span className="hidden sm:inline">Nuevo Usuario</span>
						<span className="sm:hidden">Nuevo</span>
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
				<div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
					<div className="relative w-full lg:w-96 shrink-0 z-50">
						<FiSearch
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Buscar por nombre, email o DNI..."
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full px-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-6">
							{isFetching && searchTerm ? (
								<div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
							) : (
								<AnimatePresence>
									{searchTerm && !isFetching && (
										<motion.button
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											onClick={clearSearch}
											className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1 rounded-md transition-colors"
											type="button"
										>
											<FiX size={16} />
										</motion.button>
									)}
								</AnimatePresence>
							)}
						</div>
					</div>
					<div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
						<div className="z-40">
							<SearchableSelect
								options={estadoOptions}
								value={filters.estado || ""}
								onChange={(val) => updateFilter("estado", val)}
								placeholder="Estado"
								classes={selectClasses}
							/>
						</div>
						<div className="z-30">
							<SearchableSelect
								options={rolesOptions}
								value={
									filters.id_rol ? String(filters.id_rol) : ""
								}
								onChange={(val) =>
									updateFilter(
										"id_rol",
										val ? Number(val) : undefined,
									)
								}
								placeholder="Rol del Sistema"
								classes={selectClasses}
							/>
						</div>
					</div>
				</div>
				<AnimatePresence>
					{hasActiveFilters && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="flex justify-start border-t border-gray-100 dark:border-gray-800/60 pt-3"
						>
							<button
								onClick={clearAllFilters}
								className="text-[13px] cursor-pointer font-semibold text-red-500 hover:text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5 transition-all"
							>
								<span className="p-1 rounded-md bg-red-50 dark:bg-red-900/20">
									<FiRefreshCw size={12} />
								</span>
								Limpiar Filtros
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
			<div className="w-full flex-1">
				{isLoading ? (
					<UsersListSkeleton />
				) : isError ? (
					<ErrorState
						error={error as ApiError}
						onRetry={refetch}
						title="Error al cargar usuarios"
					/>
				) : users.length === 0 ? (
					<EmptyState
						title={
							hasActiveFilters
								? "No hay coincidencias"
								: "No hay usuarios registrados"
						}
						description={
							hasActiveFilters
								? "No encontramos usuarios que coincidan con los filtros aplicados."
								: "Aún no has registrado ningún usuario en el sistema."
						}
						icon={<FiUsers className="w-10 h-10 text-gray-400" />}
					/>
				) : (
					<div className="flex flex-col gap-3">
						{users.map((user) => (
							<UserListItem
								key={user.id}
								user={user}
								onEdit={(u) => openModal("edit_user", u)}
								onDelete={(u) => openModal("delete_user", u)}
							/>
						))}
					</div>
				)}
			</div>
			{!isLoading && users.length > 0 && meta && (
				<div className="mt-auto">
					<Pagination
						currentPage={page}
						totalPages={meta.totalPages}
						onPageChange={goToPage}
						isLoading={isFetching}
						perPage={meta.limit}
						total={meta.total}
						hasNext={meta.hasNextPage}
						hasPrev={meta.hasPreviousPage}
					/>
				</div>
			)}
			<CreateUserModal
				isOpen={activeModal === "create_user"}
				onClose={closeModal}
			/>
			<EditUserModal
				isOpen={activeModal === "edit_user"}
				onClose={closeModal}
				user={selectedUser}
			/>
			<DeleteUserModal
				isOpen={activeModal === "delete_user"}
				onClose={closeModal}
				user={selectedUser}
			/>
		</div>
	);
};
