import { motion } from "motion/react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { useLogin } from "../hooks/useLogin";
import { useAuthStore } from "@/features/auth";
import { Navigate } from "react-router";

export const Login = () => {
    const {
        email,
        password,
        showPassword,
        errors,
        isLoading,
        handleEmailChange,
        handlePasswordChange,
        togglePassword,
        handleSubmit,
    } = useLogin();

    const { isAuthenticated } = useAuthStore();
    if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl relative z-10 border border-gray-100 dark:border-gray-800"
            >
                <div className="p-8 sm:p-10">
                    <div className="flex justify-center mb-8">
                        <motion.div 
                            whileHover={{ rotate: 0 }}
                            className="w-16 h-16 bg-linear-to-tr from-teal-600 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 rotate-3 transition-transform cursor-pointer"
                        >
                            <span className="text-white text-2xl font-black">AI</span>
                        </motion.div>
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Bienvenido
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            Ingresa tus credenciales para acceder al sistema
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiMail className={`text-lg ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="admin@empresa.com"
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border ${
                                        errors.email 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500'
                                    } rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiLock className={`text-lg ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border ${
                                        errors.password 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500'
                                    } rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                    Recordarme
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-teal-600 cursor-pointer hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-600/25 flex justify-center items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <BiLoaderAlt className="animate-spin text-xl mr-2" />
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <FiLogIn className="text-lg mr-2" />
                                    <span>Ingresar al Sistema</span>
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>                
                <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 py-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()}. Todos los derechos reservados.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};