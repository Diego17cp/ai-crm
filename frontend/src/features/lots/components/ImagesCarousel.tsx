import { motion } from "motion/react";
import type { ImagenLote } from "../types";
import { BACKEND_BASE_URL } from "@/shared/constants";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Props {
	currentImageIdx: number;
	imagenes: ImagenLote[];
	numeroLote: string;
	handleNextImage: (e: React.MouseEvent) => void;
	handlePrevImage: (e: React.MouseEvent) => void;
}

export const ImagesCarousel = ({
	currentImageIdx,
	imagenes,
	numeroLote,
	handleNextImage,
	handlePrevImage,
}: Props) => {
	return (
		<div className="relative w-full h-full">
			<motion.img
				key={currentImageIdx}
				initial={{ opacity: 0.3 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.2 }}
				src={`${BACKEND_BASE_URL.replace("/api", "")}/uploads/lotes_imagenes/${imagenes[currentImageIdx].url_imagen}`}
				alt={`Lote ${numeroLote} - Vista ${currentImageIdx + 1}`}
				className="w-full h-full object-cover"
			/>
			{imagenes.length > 1 && (
				<>
					<button
						onClick={handlePrevImage}
						className="absolute left-2 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-700 dark:text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-gray-800 cursor-pointer z-10"
					>
						<FiChevronLeft size={18} />
					</button>
					<button
						onClick={handleNextImage}
						className="absolute right-2 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-700 dark:text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-gray-800 cursor-pointer z-10"
					>
						<FiChevronRight size={18} />
					</button>
					<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-4 z-10">
						{imagenes.map((_, index) => (
							<div
								key={index}
								className={`h-1 rounded-full transition-all duration-300 ${
									index === currentImageIdx
										? "w-4 bg-pink-500"
										: "w-1 bg-white/50 backdrop-blur-md"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
};
