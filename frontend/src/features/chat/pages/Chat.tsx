import { useChatbot } from "../hooks/useChatbot";
import { BotMessage } from "../components/BotMessage";
import { UserMessage } from "../components/UserMessage";
import { FiArrowDown, FiSend } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { AnimatePresence, motion } from "motion/react";
import { NOMBRE_EMPRESA } from "@/shared/constants";
import { AsesorMessage } from "../components/AsesorMessage";
import { useRef, useState } from "react";

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
		isInitialLoading,
		isLiveMode,
		chatHistory,
	} = useChatbot();

	const [showScrollButton, setShowScrollButton] = useState(false);
	const mainContainerRef = useRef<HTMLDivElement>(null);

	const handleScroll = () => {
		const container = mainContainerRef.current;
		if (!container) return;
		const totalScrollable = container.scrollHeight - container.clientHeight;
		const distanceFromBottom = totalScrollable - container.scrollTop;
		if (distanceFromBottom > 100) {
			setShowScrollButton(true);
		} else {
			setShowScrollButton(false);
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	if (isFatalError)
		return (
			<div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
				<div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
					<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
						Servicio no disponible
					</h2>
					<p className="text-gray-500 dark:text-gray-400">
						No pudimos conectar con los sistemas de asistencia. Por
						favor, intenta más tarde.
					</p>
				</div>
			</div>
		);

	return (
		<div className="flex flex-col h-screen max-h-screen bg-white dark:bg-gray-950 relative">
			<header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 bg-opacity-80 backdrop-blur-md p-4 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
							{isLiveMode
								? "Asesor en línea"
								: `Asistente Comercial ${NOMBRE_EMPRESA}`}
						</h1>
						<p
							className={`text-sm font-medium flex items-center gap-1.5 ${isLiveMode ? "text-blue-500 dark:text-blue-400" : "text-teal-500 dark:text-teal-400"}`}
						>
							<span className="relative flex h-2 w-2">
								<span
									className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveMode ? "bg-blue-400" : "bg-teal-400"}`}
								></span>
								<span
									className={`relative inline-flex rounded-full h-2 w-2 ${isLiveMode ? "bg-blue-500" : "bg-teal-500"}`}
								></span>
							</span>
							{isLiveMode
								? "Atendiendo tu consulta"
								: "Siempre en línea para ayudarte"}
						</p>
					</div>
				</div>
			</header>
			<main
				ref={mainContainerRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto p-4 md:p-8 w-full main-scrollbar"
			>
				<div className="max-w-4xl mx-auto">
					{isInitialLoading ? (
						<div className="flex w-full mb-6">
							<div className="shrink-0 mr-4 mt-1">
								<div className="size-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
							</div>
							<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none w-3/4 h-20 animate-pulse" />
						</div>
					) : (
						<>
							{messages.map((msg) => {
								if (msg.role === "asesor") {
									return (
										<AsesorMessage
											key={msg.id}
											content={msg.content}
											asesor={
												chatHistory?.data.asesor ?? null
											}
										/>
									);
								}
								if (msg.role === "bot") {
									return (
										<BotMessage
											key={msg.id}
											content={msg.content}
											attachments={msg.attachments}
										/>
									);
								}
								return (
									<UserMessage
										key={msg.id}
										content={msg.content}
									/>
								);
							})}
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
			<AnimatePresence>
				{showScrollButton && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.85, x: "-50%" }}
						animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
						exit={{ opacity: 0, y: 10, scale: 0.85, x: "-50%" }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 25,
						}}
						className="absolute bottom-32 left-1/2 z-20"
					>
						<button
							type="button"
							onClick={scrollToBottom}
							className="
								flex items-center justify-center size-9 rounded-full 
								bg-white/70 dark:bg-gray-800/70 
								backdrop-blur-md 
								border border-gray-200/50 dark:border-gray-700/50 
								text-gray-600 dark:text-gray-300 shadow-md 
								hover:bg-white/90 dark:hover:bg-gray-700/90 
								active:scale-95 transition-all cursor-pointer
							"
							aria-label="Ir al último mensaje"
						>
							<FiArrowDown size={16} />
						</button>
					</motion.div>
				)}
			</AnimatePresence>
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
						{isLiveMode
							? "Estás hablando con un representante de soporte."
							: "La IA puede cometer errores. Verifica la información importante."}
					</div>
				</div>
			</footer>
		</div>
	);
};
