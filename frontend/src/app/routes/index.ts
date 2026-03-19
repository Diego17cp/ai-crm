import { lazyPage } from "./lazyFactory";

export const ChatbotPage = lazyPage(() => import("@/features/chat/pages/Chat"), "Chat");