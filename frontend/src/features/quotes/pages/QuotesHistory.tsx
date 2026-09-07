import { classes } from "@/shared/constants";
import { SearchableSelect } from "dialca-ui";
import { AnimatePresence, motion } from "motion/react";
import { FiInbox, FiPlus, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { TfiReceipt } from "react-icons/tfi";
import { useQuotes } from "../hooks/useQuotes";
import { ErrorState, EmptyState, Pagination } from "@/shared/components";
import { QuoteListItem } from "../components/QuoteListItem";
import { useQuoteModals } from "../hooks/useQuoteModals";
import { QuoteDetailModal } from "../components/QuoteDetailModal";
import { CreateQuoteModal } from "../components/CreateQuoteModal";

const selectClasses = classes.searchableSelect;

const estadoOptions = [
	{ value: "BORRADOR", label: "Borrador" },
	{ value: "EMITIDA", label: "Emitida" },
	{ value: "ACEPTADA", label: "Aceptada" },
	{ value: "RECHAZADA", label: "Rechazada" },
	{ value: "VENCIDA", label: "Vencida" },
];

const generadoPorOptions = [
	{ value: "BOT", label: "Por el Bot" },
	{ value: "ASESOR", label: "Por Asesor" },
];

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.05 },
	},
};

export const QuotesHistory = () => {
	const {
		hasActiveFilters,
		updateFilter,
		clearAllFilters,
		handleSearch,
		clearSearch,
		searchTerm,
		page,
		quotes,
		meta,
		goToPage,
		filters,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching,
	} = useQuotes();
	const { openModal, closeModals, selectedQuote, activeModal } =
		useQuoteModals();
	return (
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col gap-1"
				>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<TfiReceipt className="text-teal-600 dark:text-teal-500" />
						Historial de Cotizaciones
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Consulta y audita las cotizaciones generadas.
					</p>
				</motion.div>
				<div className="flex items-center gap-3">
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={() => openModal("create_quote")}
						className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shrink-0"
					>
						<FiPlus size={18} />
						<span className="hidden sm:inline">
							Nueva Cotización
						</span>
						<span className="sm:hidden">Nueva</span>
					</motion.button>
					<button
						onClick={() => refetch()}
						title="Recargar datos"
						className="p-3 cursor-pointer shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-500 transition-all disabled:opacity-50 flex items-center gap-2"
					>
						<FiRefreshCw
							className={isRefetching ? "animate-spin" : ""}
							size={18}
						/>
						<span className="hidden sm:inline text-sm font-medium">
							Recargar
						</span>
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
					<div className="relative w-full lg:w-96 shrink-0 z-30">
						<FiSearch
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Buscar cliente, asesor o ID..."
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full px-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-6">
							{isRefetching && searchTerm ? (
								<div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
							) : (
								<AnimatePresence>
									{searchTerm && !isRefetching && (
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
					<div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
						<div className="z-30">
							<SearchableSelect
								options={estadoOptions}
								value={filters.state || ""}
								onChange={(val) => updateFilter("state", val)}
								placeholder="Estado de Cotización"
								classes={selectClasses}
							/>
						</div>
						<div className="z-30">
							<SearchableSelect
								options={generadoPorOptions}
								value={filters.generatedBy || ""}
								onChange={(val) =>
									updateFilter("generatedBy", val)
								}
								placeholder="Generado por"
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
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div
								key={i}
								className="h-20 bg-gray-100 dark:bg-gray-800/40 rounded-2xl animate-pulse"
							/>
						))}
					</div>
				) : isError ? (
					<ErrorState
						error={error}
						onRetry={refetch}
						title="Error al cargar cotizaciones"
					/>
				) : quotes.length === 0 ? (
					<EmptyState
						title={
							hasActiveFilters || searchTerm
								? "No hay coincidencias"
								: "No hay chats registrados"
						}
						description={
							hasActiveFilters || searchTerm
								? "Intenta ajustando tus filtros de búsqueda o limpiando el campo de texto."
								: "Aún no existen conversaciones sincronizadas o finalizadas en el sistema."
						}
						icon={<FiInbox className="w-8 h-8 text-gray-400" />}
					/>
				) : (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className="flex flex-col gap-3"
					>
						<AnimatePresence mode="popLayout">
							{quotes.map((quote) => (
								<QuoteListItem
									key={quote.id}
									quote={quote}
									onClick={() =>
										openModal("view_details", quote)
									}
								/>
							))}
						</AnimatePresence>
					</motion.div>
				)}
			</div>
			{!isLoading && quotes.length > 0 && meta && (
				<div className="mt-auto flex justify-center pt-4">
					<Pagination
						currentPage={page}
						totalPages={meta.totalPages}
						onPageChange={goToPage}
						isLoading={isRefetching}
						perPage={meta.limit}
						total={meta.total}
						hasNext={meta.hasNextPage}
						hasPrev={meta.hasPreviousPage}
					/>
				</div>
			)}
			<QuoteDetailModal
				isOpen={activeModal === "view_details"}
				onClose={closeModals}
				quoteId={selectedQuote?.id || null}
			/>
      <CreateQuoteModal
        isOpen={activeModal === "create_quote"}
        onClose={closeModals}
      />
		</div>
	);
};
