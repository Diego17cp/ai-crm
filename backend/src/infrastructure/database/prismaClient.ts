import { env } from "@/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";

const connectionString = env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['info', 'error', 'warn'] : ['error'],
});