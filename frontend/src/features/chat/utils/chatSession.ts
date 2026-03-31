import { STORAGE_KEY } from "@/shared/constants/storage";

export const getOrCreateChatIdentifier = (): string => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = `web_${crypto.randomUUID()}`;
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}