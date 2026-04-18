import { ISalesRepository } from "../ports/ISalesRepository";
import { ReminderSenderService } from "../services/ReminderSenderService";

export class SendDebtsRemindersUseCase {
    constructor(
        private readonly salesRepo: ISalesRepository,
        private readonly reminderSender: ReminderSenderService
    ) {}

    async execute(): Promise<void> {
        const overdueQuotas = await this.salesRepo.getOverdueQuotas();
        for (const cuota of overdueQuotas) {
            try {
                await this.reminderSender.send(cuota, false);
            } catch (error) {
                console.error(`[Reminder] Fallo al enviar cuota #${cuota.id}:`, error);
            }
        }
    }
}