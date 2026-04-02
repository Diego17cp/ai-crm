import { FiSend, FiInbox, FiXCircle, FiUser } from "react-icons/fi";
import { VscRobot } from "react-icons/vsc";
import { useChats } from "../../hooks/useChats";
import { getCanalIcon, getRelativeWaitTime } from "../../utils/chatFormatters";
import { ErrorState } from "@/shared/components";
import { useEffect, useRef, useState } from "react";
import { useLiveChat } from "../../hooks/useLiveChat";

interface Props {
    chatId: string | null;
    isQueue: boolean;
    onTakeChat: (chatId: string) => void;
    onSendMessage: (chatId: string, message: string) => void;
}

export const LiveChatPanel = ({ chatId, isQueue, onTakeChat, onSendMessage }: Props) => {
    const { useChatByIdQuery } = useChats();
    const { useUpdateChatStatusMutation } = useLiveChat();
    const mutation = useUpdateChatStatusMutation(chatId || "", "BOT");
    const { data, isLoading, isError, error, refetch } = useChatByIdQuery(chatId || "");
    const chatData = data?.data;
    const nombreCliente = chatData?.cliente && chatData?.cliente.nombres
        ? `${chatData.cliente.nombres} ${chatData.cliente.apellidos ?? ""}`.trim()
        : "Cliente anónimo";
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const CanalIcon = getCanalIcon(chatData?.canal ?? null);
    const [inputText, setInputText] = useState("");
    const handleSend = () => {
        if (!inputText.trim() || !chatId) return;
        onSendMessage(chatId, inputText.trim());
        setInputText("");
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }
    useEffect(() => {
        if (chatData?.mensajes?.length) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData?.mensajes]);

    if (!chatId) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0b1120] text-gray-400">
                <FiInbox size={48} className="mb-4 opacity-50" />
                <p>Selecciona un chat del panel izquierdo para comenzar.</p>
            </div>
        );
    }

    if (isLoading) return (
        <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-[#0b1120]">
            <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="space-y-2">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 main-scrollbar">
                {[...Array(3)].map((_, i) => (
                    <div className="flex w-full justify-start gap-2" key={i}>
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0 mt-1" />
                        <div className="max-w-[75%] space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-48 animate-pulse" />
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-32 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
        </div>
    )

    if (isError) return (
        <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0b1120]">
            <ErrorState 
                title="Error al cargar el chat"
                error={error}
                onRetry={refetch}
            />
        </div>
    )

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0b1120]">
            <div className="h-20 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between shrink-0">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{nombreCliente}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <span className={`p-1.5 rounded-lg flex items-center gap-1.5 ${chatData?.canal === 'WHATSAPP' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                            <CanalIcon className="size-3.5" />
                            <span className="text-xs font-medium">{chatData?.canal === "WHATSAPP" ? "WhatsApp" : "Web"}</span>
                        </span>
                    </p>
                </div>
                {!isQueue && (
                    <button 
                        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                        onClick={() => mutation.mutate(undefined, {
                            onSuccess: () => window.location.reload()
                        })}
                    >
                        <FiXCircle /> Reasignar al Bot
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 main-scrollbar">
                {chatData?.mensajes.map((msg) => {
                    const isClient = msg.remitente === "HUMANO" && !msg.usuario;
                    const isAsesor = msg.remitente === "HUMANO" && !!msg.usuario;
                    const isBot = msg.remitente === "BOT";
                    return (
                        <div key={msg.id} className={`flex w-full ${!isClient ? 'justify-end' : 'justify-start'}`}>
                            {!isClient && (
                                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white mr-2 shrink-0 mt-1">
                                    {isBot ? <VscRobot size={18}/> : isAsesor ? <FiUser size={18} /> : "C"}
                                </div>
                            )}
                            <div className={`max-w-[75%] p-3 text-sm shadow-sm ${
                                isClient 
                                    ? 'bg-teal-600 text-white rounded-2xl rounded-tl-sm' 
                                    : isAsesor 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-800 rounded-2xl rounded-tr-sm' 
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tr-sm'
                            }`}>
                                <p className="leading-snug whitespace-pre-wrap">{msg.contenido}</p>
                                <span className={`text-[10px] mt-1 block opacity-70 ${!isClient ? 'text-right' : 'text-left'}`}>
                                    {getRelativeWaitTime(msg.created_at)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                {isQueue ? (
                    <button
                        className="w-full py-3.5 bg-teal-600 cursor-pointer hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-500/30 transition-all flex justify-center items-center gap-2"
                        onClick={() => onTakeChat(chatId)}
                    >
                        Unirse y Atender a este Cliente
                    </button>
                ) : (
                    <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-transparent resize-none outline-none text-sm p-2 text-gray-900 dark:text-white main-scrollbar max-h-32 min-h-10"
                        />
                        <button 
                            className="p-3 bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer text-white transition-colors shrink-0 mb-0.5"
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <FiSend size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};