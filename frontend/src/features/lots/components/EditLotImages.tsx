import {
	FiAlertCircle,
	FiImage,
	FiRefreshCw,
	FiStar,
	FiTrash2,
} from "react-icons/fi";
import { DropImages } from "./DropImages";
import { AnimatePresence, motion } from "motion/react";
import { BACKEND_BASE_URL } from "@/shared/constants";

interface Props {
	imagenesExistentes: { id: number; url_imagen: string }[];
	idPrincipalExistente: number | null;
	marcarExistenteComoPrincipal: (id: number) => void;
	toggleEliminar: (id: number) => void;
	idsAEliminar: number[];
	archivosNuevos: { id: string; preview: string }[];
	indicePrincipalNueva: number | null;
	marcarNuevaComoPrincipal: (index: number) => void;
	removerArchivoNuevo: (id: string, preview: string, index: number) => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleNuevosArchivos: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditLotImages = ({
	imagenesExistentes,
	idPrincipalExistente,
	marcarExistenteComoPrincipal,
	toggleEliminar,
	idsAEliminar,
	archivosNuevos,
	indicePrincipalNueva,
	marcarNuevaComoPrincipal,
	removerArchivoNuevo,
	fileInputRef,
	handleNuevosArchivos,
}: Props) => {
	return (
		<div className="flex flex-col gap-4 z-10 w-full">
			<label className="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-1 flex items-center gap-2">
				<FiImage className="text-teal-500" /> Imágenes del Terreno
			</label>
			<DropImages
				onClick={() => fileInputRef.current?.click()}
				onFilesDropped={(files) => {
					const dataTransfer = new DataTransfer();
					files.forEach((file) => dataTransfer.items.add(file));
					const event = {
						target: {
							files: dataTransfer.files,
						},
					} as React.ChangeEvent<HTMLInputElement>;
					handleNuevosArchivos(event);
				}}
			/>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/*"
				onChange={handleNuevosArchivos}
				className="hidden"
			/>
			{(imagenesExistentes.length > 0 || archivosNuevos.length > 0) && (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mt-2">
					<AnimatePresence mode="popLayout">
						{imagenesExistentes.map((img) => {
							const marcadaParaEliminar = idsAEliminar.includes(
								img.id,
							);
							const esPrincipal = idPrincipalExistente === img.id;
							const imgUrl = `${BACKEND_BASE_URL.replace("api", "")}uploads/lotes_imagenes/${img.url_imagen}`;

							return (
								<motion.div
									layout
									key={`existente-${img.id}`}
									initial={{
										opacity: 0,
										scale: 0.9,
									}}
									animate={{
										opacity: marcadaParaEliminar ? 0.4 : 1,
										scale: 1,
									}}
									exit={{
										opacity: 0,
										scale: 0.9,
									}}
									whileHover={
										!marcadaParaEliminar
											? {
													y: -2,
												}
											: {}
									}
									className={`
                    relative h-24 rounded-xl overflow-hidden border-2 bg-gray-50 dark:bg-gray-800 transition-all group shadow-xs
                    ${
						marcadaParaEliminar
							? "border-red-500/50 bg-red-50/10 dark:bg-red-950/5"
							: esPrincipal
								? "border-teal-500 ring-2 ring-teal-500/20"
								: "border-gray-200 dark:border-gray-700/70 hover:border-gray-300"
					}
                  `}
								>
									<img
										src={imgUrl}
										alt="Lote"
										className="w-full h-full object-cover select-none"
									/>
									<div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
										{!marcadaParaEliminar ? (
											<>
												<button
													type="button"
													onClick={() =>
														marcarExistenteComoPrincipal(
															img.id,
														)
													}
													className={`p-2 rounded-xl text-xs transition-transform active:scale-90 cursor-pointer ${esPrincipal ? "bg-amber-500 text-white" : "bg-white/90 hover:bg-white text-gray-700"}`}
													title="Marcar como principal"
												>
													<FiStar
														size={14}
														className={
															esPrincipal
																? "fill-current"
																: ""
														}
													/>
												</button>
												<button
													type="button"
													onClick={() =>
														toggleEliminar(img.id)
													}
													className="p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-xl text-xs transition-transform active:scale-90 cursor-pointer"
													title="Eliminar"
												>
													<FiTrash2 size={14} />
												</button>
											</>
										) : (
											<button
												type="button"
												onClick={() =>
													toggleEliminar(img.id)
												}
												className="p-2 bg-white text-gray-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer shadow-md"
											>
												<FiRefreshCw
													size={12}
													className="animate-spin-slow"
												/>{" "}
												Recuperar
											</button>
										)}
									</div>
									<div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
										{esPrincipal && (
											<span className="bg-teal-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
												Principal
											</span>
										)}
										{marcadaParaEliminar && (
											<span className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
												<FiAlertCircle size={10} />{" "}
												Borrar
											</span>
										)}
									</div>
								</motion.div>
							);
						})}
						{archivosNuevos.map((img, i) => {
							const esPrincipalNueva = indicePrincipalNueva === i;

							return (
								<motion.div
									layout
									key={`nueva-${img.id}`}
									initial={{
										opacity: 0,
										y: 15,
										scale: 0.9,
									}}
									animate={{
										opacity: 1,
										y: 0,
										scale: 1,
									}}
									exit={{
										opacity: 0,
										scale: 0.8,
									}}
									whileHover={{
										y: -2,
									}}
									className={`
                    relative h-24 rounded-xl overflow-hidden border-2 bg-gray-50 dark:bg-gray-800 transition-all group shadow-xs
                    ${
						esPrincipalNueva
							? "border-teal-500 ring-2 ring-teal-500/20"
							: "border-teal-200 border-dashed dark:border-teal-900/60"
					}
                  `}
								>
									<img
										src={img.preview}
										alt="Nueva"
										className="w-full h-full object-cover select-none"
									/>
									<div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
										<button
											type="button"
											onClick={() =>
												marcarNuevaComoPrincipal(i)
											}
											className={`p-2 rounded-xl text-xs transition-transform active:scale-90 cursor-pointer ${esPrincipalNueva ? "bg-amber-500 text-white" : "bg-white/90 hover:bg-white text-gray-700"}`}
											title="Marcar como principal"
										>
											<FiStar
												size={14}
												className={
													esPrincipalNueva
														? "fill-current"
														: ""
												}
											/>
										</button>
										<button
											type="button"
											onClick={() =>
												removerArchivoNuevo(
													img.id,
													img.preview,
													i,
												)
											}
											className="p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-xl text-xs transition-transform active:scale-90 cursor-pointer"
											title="Remover"
										>
											<FiTrash2 size={14} />
										</button>
									</div>
									<div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
										<span className="bg-teal-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
											Nueva
										</span>
										{esPrincipalNueva && (
											<span className="bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
												Principal
											</span>
										)}
									</div>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
};
