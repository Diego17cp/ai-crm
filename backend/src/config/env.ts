import dotenv from 'dotenv';
dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    DATABASE_URL: process.env.DATABASE_URL || "",
    JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret",
    JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH || "default_jwt_refresh_secret",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    KAPSO_API_KEY: process.env.KAPSO_API_KEY || "",
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN || "",
    AI_MODEL_PROVIDER: process.env.AI_MODEL_PROVIDER || "openai",
    META_VERIFY_TOKEN: process.env.META_VERIFY_TOKEN || "",
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || "",
    META_WHATSAPP_PHONE_NUMBER_ID: process.env.META_WHATSAPP_PHONE_NUMBER_ID || "",
    WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER || "kapso",
}