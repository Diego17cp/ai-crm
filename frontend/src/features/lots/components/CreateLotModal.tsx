import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	FiX,
	FiMapPin,
	FiAlertCircle,
	FiUploadCloud,
	FiImage,
} from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { SearchableSelect } from "dialca-ui";
import { useLots } from "../hooks/useLots";
import { apiClient } from "@/core/api";
import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/core/types";
import type { Etapa, Manzana, Proyecto } from "@/features/projects/types";
import { classes } from "@/shared/constants";
import type { LoteImagenLocal } from "../types";
import { ImagePreview } from "./ImagePreview";
import { DropImages } from "./DropImages";
import { toast } from "sonner";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	proyectos: Proyecto[];
}

const selectClasses = classes.searchableSelect;

export const CreateLotModal = ({ isOpen, onClose, proyectos }: Props) => {
	const [idProyecto, setIdProyecto] = useState<string>("");
	const [idEtapa, setIdEtapa] = useState<string>("");
	const [idManzana, setIdManzana] = useState<string>("");

	const [numeroLote, setNumeroLote] = useState("");
	const [numeroPartida, setNumeroPartida] = useState("");
	const [ubicacionReferencial, setUbicacionReferencial] = useState("");
	const [areaM2, setAreaM2] = useState("");
	const [precioM2, setPrecioM2] = useState("");

	const [imagenes, setImagenes] = useState<LoteImagenLocal[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [error, setError] = useState<string | null>(null);

	const etapasQuery = useQuery({
		queryKey: ["etapas", idProyecto],
		queryFn: async () => {
			if (!idProyecto) return [];
			const response = await apiClient.get(
				`/projects/etapas/${idProyecto}`,
			);
			return response.data.data;
		},
		enabled: Boolean(idProyecto),
	});

	const manzanasQuery = useQuery({
		queryKey: ["manzanas", idEtapa],
		queryFn: async () => {
			if (!idEtapa) return [];
			const response = await apiClient.get(
				`/projects/etapas/${idEtapa}/manzanas`,
			);
			return response.data.data;
		},
		enabled: Boolean(idEtapa),
	});

	const { useCreateLoteMutation } = useLots();
	const createLoteMutation = useCreateLoteMutation(
		{
			id_manzana: Number(idManzana),
			numero_lote: numeroLote,
			numero_partida: numeroPartida || undefined,
			area_m2: areaM2,
			precio_m2: precioM2,
			precio_total: String(Number(areaM2 || 0) * Number(precioM2 || 0)),
			estado: "Disponible",
			ubicacion_referencial: ubicacionReferencial || undefined,
		},
		imagenes,
	);

	const isSubmitting = createLoteMutation.isPending;

	useEffect(() => {
		if (isOpen) {
			setIdProyecto("");
			setIdEtapa("");
			setIdManzana("");
			setNumeroLote("");
			setNumeroPartida("");
			setAreaM2("");
			setPrecioM2("");
			setError(null);

			imagenes.forEach((img) => URL.revokeObjectURL(img.preview));
			setImagenes([]);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, isSubmitting]);

	const proyectoOptions =
		proyectos?.map((p) => ({ value: String(p.id), label: p.nombre })) || [];
	const etapaOptions =
		etapasQuery.data?.map((e: Etapa) => ({
			value: String(e.id),
			label: e.nombre,
		})) || [];
	const manzanaOptions =
		manzanasQuery.data?.map((m: Manzana) => ({
			value: String(m.id),
			label: `Mz ${m.codigo}`,
		})) || [];

	const processFiles = (filesArray: File[]) => {
		const newImages: LoteImagenLocal[] = filesArray.map((file) => ({
			id: Math.random().toString(36).substring(7),
			file,
			preview: URL.createObjectURL(file),
			isPrincipal: false,
		}));

		setImagenes((prev) => {
			const combinedImages = [...prev, ...newImages];
			if (
				combinedImages.length > 0 &&
				!combinedImages.some((img) => img.isPrincipal)
			) {
				combinedImages[0].isPrincipal = true;
			}
			return combinedImages;
		});
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			processFiles(filesArray);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const markAsMain = (id: string) => {
		setImagenes((prev) =>
			prev.map((img) => ({
				...img,
				isPrincipal: img.id === id,
			})),
		);
	};

	const removeImage = (id: string, previewUrl: string) => {
		URL.revokeObjectURL(previewUrl);
		setImagenes((prev) => {
			const filteredImages = prev.filter((img) => img.id !== id);
			if (
				filteredImages.length > 0 &&
				!filteredImages.some((img) => img.isPrincipal)
			)
				filteredImages[0].isPrincipal = true;
			return filteredImages;
		});
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		if (!idManzana) {
			toast.error("Debes asignar el lote a una manzana.");
			return setError("Debes asignar el lote a una manzana.");
		}
		if (!numeroLote.trim()) {
			toast.error("El número de lote es obligatorio.");
			return setError("El número de lote es obligatorio.");
		}
		if (!areaM2 || isNaN(Number(areaM2))) {
			toast.error("Área m² inválida.");
			return setError("Área m² inválida.");
		}
		if (!precioM2 || isNaN(Number(precioM2))) {
			toast.error("Precio m² inválido.");
			return setError("Precio m² inválido.");
		}

		createLoteMutation.mutate(undefined, {
			onSuccess: () => {
				onClose();
			},
			onError: (err: unknown) => {
				const message =
					(err as ApiError)?.response?.data?.message ||
					"Error al crear el lote.";
				toast.error(message);
				setError(message);
			},
		});
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
						onClick={() => !isSubmitting && onClose()}
					/>
					<div className="fixed inset-0 z-115 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
							}}
							className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
										<FiMapPin size={20} />
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
											Crear Nuevo Lote
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Asignar ubicación, detalles e
											imágenes
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={onClose}
									disabled={isSubmitting}
									className="p-2 cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full transition-colors"
								>
									<FiX size={20} />
								</button>
							</div>
							<form
								onSubmit={handleSubmit}
								className="flex flex-col flex-1 overflow-hidden min-h-0"
							>
								<div className="p-6 flex-1 overflow-y-auto main-scrollbar flex flex-col gap-5">
									<AnimatePresence>
										{error && (
											<motion.div
												initial={{
													opacity: 0,
													height: 0,
												}}
												animate={{
													opacity: 1,
													height: "auto",
												}}
												exit={{ opacity: 0, height: 0 }}
												className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
											>
												<FiAlertCircle className="shrink-0" />
												<span>{error}</span>
											</motion.div>
										)}
									</AnimatePresence>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/60">
										<div className="z-40">
											<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
												Proyecto{" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<SearchableSelect
												options={proyectoOptions}
												value={idProyecto}
												onChange={(val) => {
													setIdProyecto(val);
													setIdEtapa("");
													setIdManzana("");
												}}
												placeholder="Seleccionar..."
												classes={selectClasses}
												isClearable
											/>
										</div>
										<div className="z-30">
											{etapasQuery.isLoading ? (
												<div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm animate-pulse">
													Cargando etapas...
												</div>
											) : etapasQuery.isError ? (
												<div className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm">
													Error al cargar etapas
												</div>
											) : (
												<>
													<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
														Etapa{" "}
														<span className="text-red-500">
															*
														</span>
													</label>
													<SearchableSelect
														options={etapaOptions}
														value={idEtapa}
														onChange={(val) => {
															setIdEtapa(val);
															setIdManzana("");
														}}
														placeholder="Seleccionar..."
														disabled={!idProyecto}
														classes={selectClasses}
														isClearable
													/>
												</>
											)}
										</div>
										<div className="z-20">
											{manzanasQuery.isLoading ? (
												<div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm animate-pulse">
													Cargando manzanas...
												</div>
											) : manzanasQuery.isError ? (
												<div className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm">
													Error al cargar manzanas
												</div>
											) : (
												<>
													<label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1 block">
														Manzana{" "}
														<span className="text-red-500">
															*
														</span>
													</label>
													<SearchableSelect
														options={manzanaOptions}
														value={idManzana}
														onChange={setIdManzana}
														placeholder="Seleccionar..."
														disabled={!idEtapa}
														classes={selectClasses}
														isClearable
													/>
												</>
											)}
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-5 z-10 pb-4 border-b border-gray-100 dark:border-gray-800/60">
										<div className="flex flex-col gap-1.5">
											<label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
												Número de Lote{" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<input
												type="text"
												value={numeroLote}
												onChange={(e) =>
													setNumeroLote(
														e.target.value,
													)
												}
												disabled={isSubmitting}
												placeholder="Ej: L-01, 15"
												className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
											/>
										</div>
										<div className="flex flex-col gap-1.5">
											<label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
												Partida Registral (Opcional)
											</label>
											<input
												type="text"
												value={numeroPartida}
												onChange={(e) =>
													setNumeroPartida(
														e.target.value,
													)
												}
												disabled={isSubmitting}
												placeholder="Ej: 11029304"
												className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
											/>
										</div>
										<div className="flex flex-col gap-1.5">
											<label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
												Área (m²){" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<input
												type="number"
												step="0.01"
												value={areaM2}
												onChange={(e) =>
													setAreaM2(e.target.value)
												}
												disabled={isSubmitting}
												placeholder="Ej: 120.5"
												className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
											/>
										</div>
										<div className="flex flex-col gap-1.5">
											<label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
												Precio x m² (S/){" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<input
												type="number"
												step="0.01"
												value={precioM2}
												onChange={(e) =>
													setPrecioM2(e.target.value)
												}
												disabled={isSubmitting}
												placeholder="Ej: 1500"
												className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
											/>
										</div>
										<div className="flex flex-col gap-1.5 md:col-span-2">
											<label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
												Ubicación Referencial (Opcional)
											</label>
											<input
												type="text"
												value={ubicacionReferencial}
												onChange={(e) =>
													setUbicacionReferencial(
														e.target.value,
													)
												}
												disabled={isSubmitting}
												placeholder="Ej: En una esquina"
												className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
											/>
										</div>
										<div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-xl flex justify-between items-center">
											<span className="text-emerald-700 dark:text-emerald-400 font-medium">
												Precio Total Referencial
											</span>
											<span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
												S/{" "}
												{!isNaN(Number(areaM2)) &&
												!isNaN(Number(precioM2))
													? (
															Number(areaM2) *
															Number(precioM2)
														).toLocaleString(
															"es-PE",
															{
																minimumFractionDigits: 2,
															},
														)
													: "0.00"}
											</span>
										</div>
									</div>
									<div className="flex flex-col gap-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
												<FiImage size={18} />
												<h3 className="font-semibold text-sm">
													Imágenes del Lote (Opcional)
												</h3>
											</div>
											<button
												type="button"
												onClick={() =>
													fileInputRef.current?.click()
												}
												className="text-xs bg-teal-50 cursor-pointer hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 text-teal-700 dark:text-teal-400 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
											>
												<FiUploadCloud size={16} />
												Subir imágenes
											</button>
											<input
												type="file"
												ref={fileInputRef}
												onChange={handleImageChange}
												multiple
												accept="image/*"
												className="hidden"
											/>
										</div>
										{imagenes.length > 0 ? (
											<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
												<AnimatePresence>
													{imagenes.map((img) => (
														<ImagePreview
															key={img.id}
															img={img}
															markAsMain={
																markAsMain
															}
															removeImage={
																removeImage
															}
														/>
													))}
												</AnimatePresence>
											</div>
										) : (
											<DropImages
												onFilesDropped={processFiles}
												onClick={() =>
													fileInputRef.current?.click()
												}
											/>
										)}
									</div>
								</div>
								<div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
									<div className="flex justify-end gap-3">
										<button
											type="button"
											onClick={onClose}
											disabled={isSubmitting}
											className="px-6 py-3 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
										>
											Cancelar
										</button>
										<button
											type="submit"
											disabled={isSubmitting}
											className="px-8 cursor-pointer py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 flex gap-2 items-center transition-colors"
										>
											{isSubmitting ? (
												<>
													<BiLoaderAlt className="animate-spin" />{" "}
													Creando...
												</>
											) : (
												"Crear Lote"
											)}
										</button>
									</div>
								</div>
							</form>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
};
