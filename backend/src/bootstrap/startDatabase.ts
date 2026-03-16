import { prisma } from "@/infrastructure/database/prismaClient"

export const startDatabase = async () => {
    await prisma.$connect();
    console.info('Database connection established successfully.');
}