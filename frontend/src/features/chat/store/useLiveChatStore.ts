import { create } from "zustand";
import type { LiveChatQueueItem } from "../types/live";

interface LiveChatState {
    queueQueue: LiveChatQueueItem[];
    activeChats: LiveChatQueueItem[];
    setInitialQueue: (chats: LiveChatQueueItem[]) => void;
    setInitialActiveChats: (chats: LiveChatQueueItem[]) => void;
    addChatToQueue: (chat: LiveChatQueueItem) => void;
    removeChatFromQueue: (chatId: string) => void;
    moveChatToActive: (chatId: string) => void;
    updateChatLastMessage: (chatId: string, message: string) => void;
}
export const useLiveChatStore = create<LiveChatState>((set) => ({
    queueQueue: [],
    activeChats: [],
    setInitialQueue: (chats) => set({ queueQueue: chats }),
    setInitialActiveChats: (chats) => set({ activeChats: chats }),
    addChatToQueue: (chat) => set((state) => {
        if (state.queueQueue.some(c => c.id === chat.id)) return state;
        return {
            queueQueue: [chat, ...state.queueQueue]
        };
    }),
    removeChatFromQueue: (chatId) => set((state) => ({
        queueQueue: state.queueQueue.filter(chat => chat.id !== chatId)
    })),
    moveChatToActive: (chatId) => set((state) => {
        const chatToMove = state.queueQueue.find(chat => chat.id === chatId);
        if (!chatToMove) return state;
        const isAlreadyActive = state.activeChats.some(chat => chat.id === chatId);
        return {
            queueQueue: state.queueQueue.filter(chat => chat.id !== chatId),
            activeChats: isAlreadyActive ? state.activeChats : [chatToMove, ...state.activeChats],
        };
    }),
    updateChatLastMessage: (chatId, message) => set((state) => ({
        activeChats: state.activeChats.map(chat => chat.id === chatId ? { ...chat, lastMessage: message } : chat),
    })),
}));