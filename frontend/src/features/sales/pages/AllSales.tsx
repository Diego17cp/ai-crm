import { motion, AnimatePresence } from "motion/react";
import {
	FiDollarSign,
	FiPlus,
	FiRefreshCw,
	FiSearch,
    FiX
} from "react-icons/fi";
import { SearchableSelect } from "dialca-ui";
import { useSales } from "../hooks/useSales";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import type { ApiError } from "@/core/types";
import { SalesListSkeleton } from "../components/SalesListSkeleton";
import { SaleListItem } from "../components/SaleListItem";
import { useVentaModals } from "../hooks/useSalesModal";
import { CreateSaleModal } from "../components/CreateSaleModal";

const selectClasses = {
	input: "bg-gray-50! dark:bg-gray-800/50! border-transparent! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! rounded-xl! disabled:opacity-50! text-sm! py-2.5!",
	option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40! text-sm!",
	dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
	clearButton: "dark:text-gray-400! dark:hover:text-gray-200!",
};

const estadoVentaOptions = [
	{ value: "PENDIENTE", label: "Pendiente" },
	{ value: "FINALIZADA", label: "Finalizada" },
	{ value: "ANULADO", label: "Anulado" },
];

const estadoContratoOptions = [
	{ value: "ADENDA", label: "Adenda" },
	{ value: "POR RESOLVER", label: "Por Resolver" },
	{ value: "ESCRITURA PUBLICA", label: "Escritura Pública" },
	{ value: "CESION CONTRACTUAL", label: "Cesión Contractual" },
	{ value: "FIRMADO", label: "Firmado" },
];

const tipoPagoOptions = [
	{ value: "CONTADO", label: "Al Contado" },
	{ value: "CREDITO", label: "Al Crédito" },
];

export const AllSales = () => {
	const {
		sales,
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
	} = useSales();

    const { openModal, closeModal, activeModal } = useVentaModals();

	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<FiDollarSign className="text-teal-600 dark:text-teal-500" />{" "}
						Contratos de Venta
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Gestiona y monitorea todas las ventas, créditos y
						estados de los contratos.
					</p>
				</motion.div>
				<div className="flex items-center gap-3">
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={() => openModal("create_sale")}
						className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
					>
						<FiPlus size={18} />
						<span className="hidden sm:inline">Nueva Venta</span>
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
				<div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
					<div className="relative w-full lg:w-96 shrink-0 z-50">
						<FiSearch
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Buscar cliente, DNI o N° Lote..."
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
					<div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
						<div className="z-40">
							<SearchableSelect
								options={estadoVentaOptions}
								value={filters.estado_venta || ""}
								onChange={(val) =>
									updateFilter("estado_venta", val)
								}
								placeholder="Estado Venta"
								classes={selectClasses}
							/>
						</div>
						<div className="z-30">
							<SearchableSelect
								options={estadoContratoOptions}
								value={filters.estado_contrato || ""}
								onChange={(val) =>
									updateFilter("estado_contrato", val)
								}
								placeholder="Estado Contrato"
								classes={selectClasses}
							/>
						</div>
						<div className="z-20">
							<SearchableSelect
								options={tipoPagoOptions}
								value={filters.tipo_pago || ""}
								onChange={(val) =>
									updateFilter("tipo_pago", val)
								}
								placeholder="Tipo Pago"
								classes={selectClasses}
							/>
						</div>
						<div className="flex flex-col w-full z-10">
							<input
								type="date"
								title="Fecha Inicio"
								value={filters.fecha_inicio || ""}
								onChange={(e) =>
									updateFilter("fecha_inicio", e.target.value)
								}
								className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-500 dark:text-gray-400 outline-none focus:ring-1 focus:ring-teal-500 transition-all scheme-light dark:scheme-dark"
							/>
						</div>
						<div className="flex flex-col w-full z-10">
							<input
								type="date"
								title="Fecha Fin"
								value={filters.fecha_fin || ""}
								onChange={(e) =>
									updateFilter("fecha_fin", e.target.value)
								}
								className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-500 dark:text-gray-400 outline-none focus:ring-1 focus:ring-teal-500 transition-all scheme-light dark:scheme-dark"
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
					<SalesListSkeleton />
				) : isError ? (
					<ErrorState
						error={error as ApiError}
						onRetry={refetch}
						title="Error al cargar las ventas"
					/>
				) : sales.length === 0 ? (
					<EmptyState
						title={
							hasActiveFilters
								? "No hay contratos que coincidan"
								: "No hay ventas registradas"
						}
						description={
							hasActiveFilters
								? "Intenta modificar el rango de fechas, estados o limpiar los filtros."
								: "Aún no se ha cerrado ningún contrato de venta en el sistema."
						}
						icon={
							<FiDollarSign className="w-10 h-10 text-gray-400" />
						}
					/>
				) : (
					<div className="flex flex-col gap-3">
						{sales.map((venta) => (
							<SaleListItem
                                key={venta.id}
                                venta={venta} 
                            />
						))}
					</div>
				)}
			</div>
			{!isLoading && sales.length > 0 && meta && (
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
            <CreateSaleModal
                isOpen={activeModal === "create_sale"}
                onClose={closeModal}
            />
		</div>
	);
};
