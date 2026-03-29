import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiCheckCircle, FiInfo } from "react-icons/fi";
import { VscRobot } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";
import { useChats } from "../hooks/useChats";
import { formatChatDate, getEstadoChatConfig } from "../utils/chatFormatters";

interface ChatDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string | null;
}

export const ChatDetailsModal = ({ isOpen, onClose, chatId }: ChatDetailsModalProps) => {
    const { useChatByIdQuery } = useChats();
    const { data: response, isLoading, isError } = useChatByIdQuery(chatId || "");
    
    const chatDetails = response?.data;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatDetails?.mensajes?.length) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatDetails?.mensajes]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-115 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
                                {isLoading ? (
                                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                                ) : chatDetails ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                                                {chatDetails.cliente
                                                    ? `${chatDetails.cliente.nombres || ""} ${chatDetails.cliente.apellidos || ""}`
                                                    : "Cliente Anónimo"}
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEstadoChatConfig(chatDetails.estado).colorClass}`}>
                                                    {getEstadoChatConfig(chatDetails.estado).label}
                                                </span>
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Asesor: {chatDetails.asesor ? `${chatDetails.asesor.nombres}` : "Bot / Sin asignar"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <h2 className="text-lg font-bold">Detalles de Chat</h2>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] dark:bg-[#0f172a]/50 main-scrollbar flex flex-col gap-5">
                                {isLoading ? (
                                    <div className="flex flex-col gap-6 w-full">
                                        {[...Array(4)].map((_, i) => {
                                            const isRight = i % 2 !== 0;
                                            return (
                                                <div key={i} className={`flex max-w-[80%] ${isRight ? "self-end justify-end" : "self-start"} w-full gap-3`}>
                                                    {!isRight && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />}
                                                    <div className={`h-16 w-3/4 sm:w-1/2 bg-gray-200 dark:bg-gray-800 animate-pulse ${isRight ? "rounded-l-2xl rounded-tr-2xl" : "rounded-r-2xl rounded-tl-2xl"}`} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : isError ? (
                                    <div className="flex-1 flex flex-col justify-center items-center text-center opacity-70">
                                        <FiInfo size={40} className="mb-3 text-red-500" />
                                        <p className="text-gray-600 dark:text-gray-300">Error al cargar el historial de mensajes.</p>
                                    </div>
                                ) : chatDetails?.mensajes?.length === 0 ? (
                                    <div className="flex-1 flex flex-col justify-center items-center text-center opacity-70">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-500">
                                            <FiCheckCircle size={24} />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">Este chat no tiene mensajes registrados.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full">
                                        {chatDetails?.mensajes?.map((msg, index) => {
                                            const isClient = msg.remitente === "HUMANO" && !msg.usuario;
                                            const isBot = msg.remitente === "BOT";
                                            const contenidoMensaje = msg.contenido || "Mensaje sin formato";

                                            return (
                                                <motion.div
                                                    key={msg.id || index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`flex w-full mb-5 max-w-[85%] sm:max-w-[75%] gap-2 sm:gap-3 ${isClient ? "self-end justify-end" : "self-start"}`}
                                                >
                                                    {!isClient && (
                                                        <div className="shrink-0 mt-3 sm:mt-4">
                                                            {isBot ? (
                                                                <div className="size-8 sm:size-9 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm">
                                                                    <VscRobot size={20} />
                                                                </div>
                                                            ) : (
                                                                <div className="size-8 sm:size-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
                                                                    {msg.usuario?.nombres?.charAt(0).toUpperCase() || "A"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`flex flex-col w-full ${isClient ? "items-end" : "items-start"}`}>
                                                        {!isClient && (
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 ml-1 font-medium tracking-wide">
                                                                {isBot ? "Bot Automático" : `${msg.usuario?.nombres} ${msg.usuario?.apellidos}`}
                                                            </span>
                                                        )}
                                                        <div 
                                                            className={`p-3 sm:p-4 text-sm shadow-sm
                                                            ${isClient 
                                                                ? "bg-teal-600 text-white rounded-2xl rounded-tr-sm" 
                                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/60 rounded-2xl rounded-tl-sm"
                                                            }`}
                                                        >
                                                            {isBot ? (
                                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-a:text-teal-500 prose-ul:pl-4">
                                                                    <ReactMarkdown>{contenidoMensaje}</ReactMarkdown>
                                                                </div>
                                                            ) : (
                                                                <div className="whitespace-pre-wrap wrap-break-words leading-snug">
                                                                    {contenidoMensaje}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] text-gray-400 dark:text-gray-500 mt-1 ${isClient ? "mr-1" : "ml-1"}`}>
                                                            {formatChatDate(msg.created_at)}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} className="h-2" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
                                >
                                    Cerrar Conversación
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};