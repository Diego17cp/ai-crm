import { useState } from "react";
import { type MetodoPago } from "../../types";
import { useSales } from "../../hooks/useSales";
import { FiX, FiUploadCloud, FiFile } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	cuotaId: number;
	saleId: number;
}

export const PayQuotaModal = ({ isOpen, onClose, cuotaId }: Props) => {
	const { usePayQuotaMutation } = useSales();
	const [metodoPago, setMetodoPago] = useState<MetodoPago>("TRANSFERENCIA");
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const mutation = usePayQuotaMutation(cuotaId);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const objectUrl = URL.createObjectURL(file);
			setFilePreview(objectUrl);
		}
	};
	const handleRemoveFile = () => {
		setFilePreview(null);
		setSelectedFile(null);
	};

	const confirmPayment = () => {
		if (!selectedFile) {
			toast.error("Debe subir un comprobante");
			return;
		}
		if (!metodoPago) {
			toast.error("Debe seleccionar un método de pago");
			return;
		}
		mutation.mutate(
			{ metodoPago, comprobante: selectedFile },
			{
				onSuccess: () => {
					onClose();
					handleRemoveFile();
				},
			},
		);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 z-60 backdrop-blur-sm shadow-xl"
						onClick={onClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-70 overflow-hidden"
					>
						<div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
								Registrar Pago de Cuota
							</h2>
							<button
								onClick={onClose}
								className="text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
							>
								<FiX size={20} />
							</button>
						</div>
						<div className="p-6 space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Método de Pago
								</label>
								<select
									value={metodoPago}
									onChange={(e) =>
										setMetodoPago(
											e.target.value as MetodoPago,
										)
									}
									className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
								>
									<option value="TRANSFERENCIA">
										Transferencia / Yape
									</option>
									<option value="DEPOSITO">
										Depósito Bancario
									</option>
									<option value="EFECTIVO">
										Efectivo en Caja
									</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Comprobante{" "}
									<sup className="text-red-500">*</sup>
								</label>
								{!filePreview ? (
									<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<FiUploadCloud
												className="mb-2 text-gray-400"
												size={24}
											/>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Clic para subir imagen o PDF
											</p>
										</div>
										<input
											type="file"
											className="hidden"
											accept="image/*,application/pdf"
											onChange={handleFileChange}
										/>
									</label>
								) : (
									<div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center group transition-colors hover:border-gray-200 dark:hover:border-gray-700">
										{selectedFile?.type.startsWith(
											"image/",
										) ? (
											<div className="relative w-full h-full flex items-center justify-center p-2">
												<div
													className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-15 blur-md scale-105 pointer-events-none select-none"
													style={{
														backgroundImage: `url(${filePreview})`,
													}}
												/>
												<img
													src={filePreview}
													alt="Comprobante"
													className="relative z-10 max-w-full max-h-full object-contain rounded-lg drop-shadow-xs transition-transform duration-300 group-hover:scale-[1.01]"
												/>
											</div>
										) : (
											<div className="flex items-center gap-3 p-4 w-full relative pr-12">
												<div className="shrink-0 w-9 h-9 bg-linear-to-tr from-teal-500/10 to-teal-500/5 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center border border-teal-500/10 text-lg shadow-xs">
													<FiFile />
												</div>
												<div className="flex-1 min-w-0">
													<p
														className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate"
														title={
															selectedFile?.name
														}
													>
														{selectedFile?.name}
													</p>
													<p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wider font-semibold">
														{selectedFile?.size
															? (
																	selectedFile.size /
																	1024 /
																	1024
																).toFixed(2)
															: "0"}{" "}
														MB
													</p>
												</div>
											</div>
										)}
										<button
											type="button"
											onClick={handleRemoveFile}
											className="absolute top-2 right-2 z-20 p-1.5 bg-white/80 dark:bg-gray-800/85 text-gray-400 hover:text-red-500 rounded-md backdrop-blur-xs border border-gray-100 dark:border-gray-700 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center"
											title="Remover archivo"
										>
											<FiX className="text-sm stroke-[2.5]" />
										</button>
									</div>
								)}
							</div>
						</div>
						<div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
							<button
								onClick={onClose}
								className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								Cancelar
							</button>
							<button
								onClick={confirmPayment}
								disabled={mutation.isPending}
								className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
							>
								{mutation.isPending && (
									<span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4" />
								)}
								Confirmar Pago
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
