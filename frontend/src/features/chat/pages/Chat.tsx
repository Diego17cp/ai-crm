import { useChatbot } from "../hooks/useChatbot";
import { BotMessage } from "../components/BotMessage";
import { UserMessage } from "../components/UserMessage";
import { FiSend } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { motion } from "motion/react";
import { NOMBRE_EMPRESA } from "@/shared/constants";

export const Chat = () => {
	const {
		messages,
		inputValue,
		isLoading,
		isError,
		messagesEndRef,
		handleInputChange,
		handleSubmit,
		isFatalError,
		isInitialLoading
	} = useChatbot();

	if (isFatalError) return (
		<div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
			<div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
				<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
					Servicio no disponible
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					No pudimos conectar con los sistemas de asistencia. Por favor, intenta más tarde.
				</p>
			</div>
		</div>
	);

	return (
		<div className="flex flex-col h-screen max-h-screen bg-white dark:bg-gray-950">
			<header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 bg-opacity-80 backdrop-blur-md p-4 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
							Asistente Comercial {NOMBRE_EMPRESA}
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Siempre en línea para ayudarte
						</p>
					</div>
				</div>
			</header>
			<main className="flex-1 overflow-y-auto p-4 md:p-8 w-full main-scrollbar">
				<div className="max-w-4xl mx-auto">
					{isInitialLoading ? (
						<div className="flex w-full mb-6">
                            <div className="shrink-0 mr-4 mt-1">
                                <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none w-3/4 h-20 animate-pulse" />
                        </div>
					): (
						<>
							{messages.map((msg) =>
								msg.role === "bot" ? (
									<BotMessage key={msg.id} content={msg.content} />
								) : (
									<UserMessage key={msg.id} content={msg.content} />
								),
							)}
						</>
					)}
					{isLoading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex w-full mb-6"
						>
							<div className="shrink-0 mr-4 mt-1">
								<div className="size-10 rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-sm">
									<BiLoaderAlt
										className="animate-spin"
										size={20}
									/>
								</div>
							</div>
							<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-5 py-5 flex items-center gap-1.5 shadow-sm min-h-12">
								<motion.div
									className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
									animate={{ y: [0, -5, 0] }}
									transition={{
										duration: 0.6,
										repeat: Infinity,
										ease: "easeInOut",
										delay: 0,
									}}
								/>
								<motion.div
									className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
									animate={{ y: [0, -5, 0] }}
									transition={{
										duration: 0.6,
										repeat: Infinity,
										ease: "easeInOut",
										delay: 0.2,
									}}
								/>
								<motion.div
									className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
									animate={{ y: [0, -5, 0] }}
									transition={{
										duration: 0.6,
										repeat: Infinity,
										ease: "easeInOut",
										delay: 0.4,
									}}
								/>
							</div>
						</motion.div>
					)}
					{isError && (
						<div className="text-center text-red-500 text-sm mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
							Ocurrió un error al conectar con el servidor.
							Intenta enviando otro mensaje.
						</div>
					)}
					<div ref={messagesEndRef} className="h-4" />
				</div>
			</main>
			<footer className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
				<div className="max-w-4xl mx-auto">
					<form
						onSubmit={handleSubmit}
						className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-teal-500 transition-shadow"
					>
						<input
							type="text"
							value={inputValue}
							onChange={handleInputChange}
							placeholder="Escribe tu consulta sobre lotes, precios..."
							className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none px-4 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none"
							disabled={isLoading}
						/>
						<button
							type="submit"
							disabled={!inputValue.trim() || isLoading}
							className="shrink-0 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-500/50 dark:disabled:bg-teal-900 disabled:cursor-not-allowed text-white rounded-full size-12 flex items-center justify-center transition-colors shadow-sm"
							aria-label="Enviar mensaje"
						>
							<FiSend size={20} className="" />
						</button>
					</form>
					<div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
						La IA puede cometer errores. Verifica la información
						importante.
					</div>
				</div>
			</footer>
		</div>
	);
};
