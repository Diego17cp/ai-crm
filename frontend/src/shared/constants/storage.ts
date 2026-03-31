import { NOMBRE_EMPRESA } from "./core";

const formattedPrefix = NOMBRE_EMPRESA.toLowerCase().replace(/\s+/g, '_');
export const STORAGE_KEY = `${formattedPrefix}:chat_session_id`;
export const SIDEBAR_KEY = `${formattedPrefix}:sidebar_open`;
export const THEME_KEY = `${formattedPrefix}:theme_mode`;