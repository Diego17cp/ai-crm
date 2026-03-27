import { useLocation, useNavigate } from "react-router";

export const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center select-none bg-gray-50 dark:bg-gray-950">
            <div className="relative mb-6">
                <h1 className="text-[120px] sm:text-[180px] font-black text-gray-200 dark:text-gray-800/60 leading-none pointer-events-none tracking-tighter">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent transform translate-y-3">
                        ¡Ups!
                    </span>
                </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                Página no encontrada
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                Lo sentimos, la ruta a la que intentas acceder no existe o ha sido movida. Verifica la URL ingresada.
            </p>

            <button
                onClick={() => navigate(isAdminRoute ? "/admin" : "/")}
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all bg-teal-600 rounded-xl hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al panel inicial
            </button>
        </div>
    );
};