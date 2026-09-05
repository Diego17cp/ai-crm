import type { ToolAttachment } from "@/shared/types";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { FiDownload, FiFileText, FiX } from "react-icons/fi";

interface Props {
	isOpen: boolean;
	onClose(): void;
	attachment: ToolAttachment;
}

export const AttachmentPreviewModal = ({
	isOpen,
	onClose,
	attachment,
}: Props) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
						onClick={onClose}
					/>
					<div className="fixed inset-0 z-115 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
							}}
							className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
						>
							<div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
								<div className="flex items-center gap-3 min-w-0">
									<div className="size-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
										<FiFileText size={18} />
									</div>
									<div className="min-w-0">
										<h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
											{attachment.title}
										</h2>
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											{attachment.filename ||
												"Vista previa del documento"}
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors shrink-0"
								>
									<FiX size={20} />
								</button>
							</div>
							<div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
								<iframe
									src={attachment.url}
									className="w-full h-full border-0"
									title={attachment.title}
								/>
							</div>
							<div className="p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0 flex justify-end gap-3">
								<a
									href={attachment.url}
									download={attachment.filename}
									target="_blank"
									rel="noopener noreferrer"
									className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
								>
									<FiDownload size={16} />
									Descargar documento
								</a>
								<button
									onClick={onClose}
									className="cursor-pointer px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-sm font-medium transition-colors"
								>
									Cerrar
								</button>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
};
