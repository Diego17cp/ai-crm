import { FiDownload, FiEye, FiX, FiFileText } from "react-icons/fi";
import { useState } from "react";
import type { ToolAttachment } from "@/shared/types/attachment";
import { AttachmentPreviewModal } from "./AttachmentPreviewModal";

interface AttachmentCardProps {
	attachment: ToolAttachment;
}

export const AttachmentCard = ({ attachment }: AttachmentCardProps) => {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<>
			<div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-sm max-w-sm p-2">
				<div className="flex items-center gap-3 p-3">
					<div className="shrink-0 size-11 rounded-lg bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-sm">
						<FiFileText size={20} />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
							{attachment.title}
						</p>
						{/* <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
							{attachment.filename} · PDF
						</p> */}
					</div>
				</div>

				<div className="flex divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
					{attachment.available_preview && (
						<button
							onClick={() => setShowPreview((v) => !v)}
							className="flex-1 flex items-center cursor-pointer justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
						>
							{showPreview ? (
								<FiX size={14} />
							) : (
								<FiEye size={14} />
							)}
							{showPreview ? "Cerrar" : "Ver documento"}
						</button>
					)}
					<a
						href={attachment.url}
						download={attachment.filename}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
					>
						<FiDownload size={14} />
						Descargar
					</a>
				</div>
			</div>
			<AttachmentPreviewModal
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
				attachment={attachment}
			/>
		</>
	);
};
