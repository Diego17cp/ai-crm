import { IWhatsappService } from "@/modules/chatbot/application/ports/IWhatsappService";
import { ISalesRepository } from "../ports/ISalesRepository";

type ReminderLevel = "today" | "soon" | "overdue";

export class SendDebtsRemindersUseCase {
    constructor(
        private readonly salesRepo: ISalesRepository,
        private readonly whatsappService: IWhatsappService
    ) {}

    async execute(): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
        const overdueQuotas = await this.salesRepo.getOverdueQuotas();
        for (const cuota of overdueQuotas) {
            const phone = cuota.venta.cliente.telefonos
                .find(t => t.tipo?.toUpperCase() === "WHATSAPP")?.numero;
            if (!phone) {
                console.log(`[Reminder] Cliente sin número de WhatsApp registrado, cuota #${cuota.id} omitida.`);
                continue;
            }
            const daysOverdue = this.getDaysOverdue(cuota.fecha_vencimiento, today);
            const level = this.getReminderLevel(daysOverdue);
            const cliente = cuota.venta.cliente;
            const lote = cuota.venta.lote;
            const proyecto = cuota.venta.lote.manzana.etapa.proyecto;
            const manzana = cuota.venta.lote.manzana;
            const clientName = cliente.nombres?.trim();
            try {
                await this.sendReminder(phone, {
                    clientName: clientName && clientName.length > 0 ? clientName : "Cliente",
                    project: proyecto.nombre,
                    block: manzana.codigo,
                    lot: lote.numero_lote.replace(/^\D+/g, ""), // Eliminar prefijos no numéricos
                    amount: Number(cuota.monto_cuota),
                    dueDate: cuota.fecha_vencimiento.toLocaleDateString("es-PE"),
                    daysOverdue,
                    paymentCode: cliente.numero,
                    level
                });
                console.log(`[Reminder] ${level} → ${phone} (${clientName}) - cuota #${cuota.id}`);
            } catch (error) {
                console.error(`[Reminder] Fallo al enviar a ${phone} - cuota #${cuota.id}:`, error);
            }
        }
    }

    private getDaysOverdue(fechaVencimiento: Date, today: Date): number {
        const diff = today.getTime() - fechaVencimiento.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    private getReminderLevel(daysOverdue: number): ReminderLevel {
        if (daysOverdue > 0) return "overdue";
        if (daysOverdue === 0) return "today";
        return "soon";
    }
    private async sendReminder(phone: string, data: {
        clientName: string;
        project: string;
        block: string;
        lot: string;
        amount: number;
        dueDate: string;
        daysOverdue: number;
        paymentCode: string;
        level: ReminderLevel;
    }): Promise<void> {
        const date = data.dueDate;
        const amount = data.amount.toFixed(2);

        const baseParams = [
            data.clientName,
            data.block,
            data.lot,
            data.project,
            date
        ]
        const templates: Record<ReminderLevel, { name: string; parameters: string[] }> = {
            today: {
                name: "recordatorio_pago_vence_hoy",
                parameters: [
                    ...baseParams,
                    date,
                    amount,
                    data.paymentCode
                ]
            },
            soon: {
                name: "recordatorio_pago_lote",
                parameters: [
                    ...baseParams,
                    date,
                    amount,
                    data.paymentCode
                ]
            },
            overdue: {
                name: "notificacion_cuota_vencida",
                parameters: [
                    ...baseParams,
                    amount,
                    data.paymentCode
                ]
            }
        };
        const { name, parameters } = templates[data.level];
        const sendTemplateMessage = this.whatsappService.sendTemplateMessage;
        if (!sendTemplateMessage) {
            console.warn(`[Reminder] whatsappService.sendTemplateMessage no implementado`);
            return
        }
        await sendTemplateMessage.call(this.whatsappService, phone, name, parameters, "en_US");
    }
}   