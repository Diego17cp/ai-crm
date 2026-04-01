import { create } from "zustand";
import type { LiveChatQueueItem } from "../types/live";

interface LiveChatState {
    queueQueue: LiveChatQueueItem[];
    activeChats: LiveChatQueueItem[];
    setInitialQueue: (chats: LiveChatQueueItem[]) => void;
    setInitialActiveChats: (chats: LiveChatQueueItem[]) => void;
    addChatToQueue: (chat: LiveChatQueueItem) => void;
    removeChatFromQueue: (chatId: string) => void;
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
    }))
}));