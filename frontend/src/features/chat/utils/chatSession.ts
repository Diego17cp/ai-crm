export const getOrCreateChatIdentifier = (): string => {
    const STORAGE_KEY = "inmobiliaria_chat_id";
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = `web_${crypto.randomUUID()}`;
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}