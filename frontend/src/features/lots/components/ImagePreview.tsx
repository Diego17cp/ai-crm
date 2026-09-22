import { motion } from "motion/react";
import { FiStar, FiTrash2 } from "react-icons/fi";
import type { LoteImagenLocal } from "../types";

interface Props {
	img: LoteImagenLocal;
	markAsMain: (id: string) => void;
	removeImage: (id: string, preview: string) => void;
}

export const ImagePreview = ({ img, markAsMain, removeImage }: Props) => {
	return (
		<motion.div
			key={img.id}
			initial={{
				opacity: 0,
				scale: 0.9,
			}}
			animate={{
				opacity: 1,
				scale: 1,
			}}
			exit={{
				opacity: 0,
				scale: 0.9,
			}}
			className={`relative group rounded-xl overflow-hidden border-2 aspect-square ${img.isPrincipal ? "border-amber-400 shadow-md shadow-amber-400/20" : "border-gray-200 dark:border-gray-700 hover:border-pink-400/50"}`}
		>
			<img
				src={img.preview}
				alt="Preview"
				className="w-full h-full object-cover"
			/>
			<div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
				<button
					type="button"
					onClick={() => removeImage(img.id, img.preview)}
					className="self-end p-1.5 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-400 transition-colors"
				>
					<FiTrash2 size={14} />
				</button>
				{!img.isPrincipal && (
					<button
						type="button"
						onClick={() => markAsMain(img.id)}
						className="w-full py-1 text-xs cursor-pointer bg-gray-900/80 text-white rounded transform translate-y-2 group-hover:translate-y-0 transition-all font-medium"
					>
						Marcar Principal
					</button>
				)}
			</div>
			{img.isPrincipal && (
				<div className="absolute top-2 left-2 p-1 bg-amber-400 text-amber-900 rounded-md shadow-sm">
					<FiStar size={14} className="fill-current" />
				</div>
			)}
		</motion.div>
	);
};
