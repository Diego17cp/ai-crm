import { useState } from "react";
import { motion } from "motion/react";
import { FiUploadCloud, FiImage } from "react-icons/fi";

interface Props {
	onClick: () => void;
	onFilesDropped?: (files: File[]) => void;
}

export const DropImages = ({ onClick, onFilesDropped }: Props) => {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFiles = Array.from(e.dataTransfer.files);

			const imageFiles = droppedFiles.filter((file) =>
				file.type.startsWith("image/"),
			);

			if (imageFiles.length > 0) {
				onFilesDropped?.(imageFiles);
			}
		}
	};

	return (
		<motion.div
			onClick={onClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			animate={{
				scale: isDragging ? 1.01 : 1,
				borderColor: isDragging
					? "rgb(20, 184, 166)"
					: "rgba(229, 231, 235, 1)",
			}}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			className={`
				border-2 border-dashed rounded-2xl p-10 
				flex flex-col items-center justify-center text-center 
				cursor-pointer transition-colors mt-2 group relative overflow-hidden
				${
					isDragging
						? "bg-pink-50/50 dark:bg-pink-950/20 border-pink-500"
						: "border-gray-200 dark:border-gray-700/60! hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
				}
			`}
		>
			{isDragging && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="absolute inset-0 bg-pink-500/5 pointer-events-none"
				/>
			)}

			<motion.div
				animate={{ y: isDragging ? -6 : 0 }}
				className={`
					p-4 rounded-2xl shadow-xs transition-colors mb-3
					${
						isDragging
							? "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
							: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:text-pink-500 group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10"
					}
				`}
			>
				{isDragging ? (
					<FiImage size={28} className="animate-pulse" />
				) : (
					<FiUploadCloud size={28} />
				)}
			</motion.div>

			<div className="space-y-1 z-10 pointer-events-none">
				<p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
					{isDragging
						? "¡Suéltalas aquí mismo!"
						: "Arrastra tus imágenes o haz click"}
				</p>
				<p className="text-xs text-gray-400 dark:text-gray-500">
					{isDragging
						? "Formatos de imagen soportados"
						: "Soporta JPG, PNG y WEBP hasta 10MB"}
				</p>
			</div>
		</motion.div>
	);
};
