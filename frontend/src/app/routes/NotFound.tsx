import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";

export const NotFound = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 text-center select-none bg-gray-50 dark:bg-gray-950 overflow-hidden">
			<div className="relative mb-6">
				<motion.h1
					animate={{ y: [0, -12, 0] }}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="text-[120px] sm:text-[180px] font-black text-gray-200 dark:text-gray-800/40 leading-none pointer-events-none tracking-tighter select-none filter drop-shadow-xs"
				>
					404
				</motion.h1>
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.span
						initial={{ scale: 0.3, opacity: 0, y: 30 }}
						animate={{ scale: 1, opacity: 1, y: 12 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 15,
							delay: 0.1,
						}}
						className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-pink-600 to-cyan-600 dark:from-pink-400 dark:to-cyan-400 bg-clip-text text-transparent transform"
					>
						¡Ups!
					</motion.span>
				</div>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.25, duration: 0.4 }}
				className="flex flex-col items-center"
			>
				<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
					Página no encontrada
				</h2>
				<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
					Lo sentimos, la ruta a la que intentas acceder no existe o
					ha sido movida. Verifica la URL ingresada.
				</p>
				<motion.button
					whileTap={{ scale: 0.97 }}
					onClick={() => navigate(isAdminRoute ? "/admin" : "/")}
					className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all bg-pink-600 rounded-xl hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 active:scale-[0.98] shadow-sm group"
				>
					<FiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform duration-300" />
					Volver al panel inicial
				</motion.button>
			</motion.div>
		</div>
	);
};
