import { env } from "@/config";
import { prisma } from "@/infrastructure/database/prismaClient";
import { KapsoWhatsAppService } from "@/modules/chatbot/infrastructure/adapters/KapsoWhatsAppService";
import { MetaWhatsappService } from "@/modules/chatbot/infrastructure/adapters/MetaWhatsappService";
import { ReminderSenderService } from "@/modules/sales/application/services/ReminderSenderService";
import { SendDebtsRemindersUseCase } from "@/modules/sales/application/use-cases/SendDebtsRemindersUseCase";
import { PrismaSalesRepository } from "@/modules/sales/infrastructure/adapters/PrismaSalesRepository";

async function main() {
    console.log("[Script] Enviando recordatorios de deuda...");
    try {
        const salesRepo = new PrismaSalesRepository(prisma);
        let whatsappService;
        switch (env.WHATSAPP_PROVIDER?.toLowerCase()) {
            case "meta":
                whatsappService = new MetaWhatsappService();
                break;
            case "kapso":
                whatsappService = new KapsoWhatsAppService();
                break;
            default:
                throw new Error(`Proveedor de WhatsApp no soportado: ${env.WHATSAPP_PROVIDER}`);
        }
        const reminderSender = new ReminderSenderService(whatsappService, salesRepo);
        const sendRemindersUseCase = new SendDebtsRemindersUseCase(salesRepo, reminderSender);
        
        await sendRemindersUseCase.execute();
        console.log("[Script] Recordatorios de deuda enviados.");
    } catch (error) {
        console.error("[Script] Error al enviar recordatorios de deuda:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
main();