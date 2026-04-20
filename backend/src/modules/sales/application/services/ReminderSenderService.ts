import { IWhatsappService } from "@/modules/chatbot/application/ports/IWhatsappService";
import { ReminderLevel } from "../../domain/dtos";
import { AppError } from "@/core/errors/AppError";
import { CuotaWithRelations, ISalesRepository } from "../ports/ISalesRepository";

export class ReminderSenderService {
	constructor(
		private readonly whatsappService: IWhatsappService,
		private readonly salesRepo: ISalesRepository
	) {}

	async send(
		cuota: CuotaWithRelations,
		options: {
			isManual: boolean,
			userId?: string
		}
	): Promise<void> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const fechaVencimiento = new Date(cuota.fecha_vencimiento);
		fechaVencimiento.setHours(0, 0, 0, 0);

		const daysOverdue = Math.floor(
			(today.getTime() - fechaVencimiento.getTime()) /
				(1000 * 60 * 60 * 24),
		);

		if (daysOverdue < -5)
			throw new AppError(
				"Aún es muy pronto para notificar esta cuota. Solo se permite desde 5 días antes del vencimiento.",
				400,
			);

		const phone = cuota.venta.cliente.telefonos.find(
			(t) => t.tipo?.toUpperCase() === "WHATSAPP",
		)?.numero;
		if (!phone) {
			if (options.isManual)
				throw new AppError(
					"El cliente no tiene un número de WhatsApp registrado.",
					400,
				);
			return;
		}

		const level = this.getReminderLevel(daysOverdue);
		const cliente = cuota.venta.cliente;
		const lote = cuota.venta.lote;
		const proyecto = lote.manzana.etapa.proyecto;

		const dueDateUtc = new Intl.DateTimeFormat("es-PE", {
			timeZone: "UTC",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(cuota.fecha_vencimiento);

		const templateName = await this.dispatchTemplate(phone, {
			clientName: cliente.nombres?.trim() || "Cliente",
			project: proyecto.nombre,
			block: lote.manzana.codigo,
			lot: lote.numero_lote.replace(/^\D+/g, ""),
			amount: Number(cuota.monto_cuota),
			dueDate: dueDateUtc,
			daysOverdue,
			paymentCode: cliente.numero,
			level,
		});
		await this.salesRepo.logReminder({
			id_cuota: cuota.id,
			id_usuario: options.isManual ? (options.userId || null) : null,
			template: templateName,
			telefono_destino: phone,
			nivel_urgencia: level,
			es_automatica: !options.isManual,
		});
	}

	private getReminderLevel(daysOverdue: number): ReminderLevel {
		if (daysOverdue > 0) return "overdue";
		if (daysOverdue === 0) return "today";
		return "soon";
	}

	private async dispatchTemplate(
		phone: string,
		data: {
			clientName: string;
			project: string;
			block: string;
			lot: string;
			amount: number;
			dueDate: string;
			daysOverdue: number;
			paymentCode: string;
			level: ReminderLevel;
		},
	): Promise<string> {
		const date = data.dueDate;
		const amount = data.amount.toFixed(2);
		const formattedPhone = phone.startsWith("51") ? phone : `51${phone}`;

		const baseParams = [
			data.clientName,
			data.block,
			data.lot,
			data.project,
			date,
		];
		const templates: Record<
			ReminderLevel,
			{ name: string; parameters: string[] }
		> = {
			today: {
				name: "recordatorio_pago_vence_hoy",
				parameters: [...baseParams, date, amount, data.paymentCode],
			},
			soon: {
				name: "recordatorio_pago_lote",
				parameters: [...baseParams, date, amount, data.paymentCode],
			},
			overdue: {
				name: "notificacion_cuota_vencida",
				parameters: [...baseParams, amount, data.paymentCode],
			},
		};
		const template = templates[data.level];
		const { name, parameters } = template;
		let langCode = "es_PE";
		const sendTemplateMessage = this.whatsappService.sendTemplateMessage;
		if (!sendTemplateMessage) {
			console.warn(
				`[Reminder] whatsappService.sendTemplateMessage no implementado`,
			);
			throw new AppError("El servicio de WhatsApp no soporta mensajes template", 500);
		}
		if (template.name === "recordatorio_pago_lote") langCode = "es"; // El template está configurado con idioma "es" en Meta Business, no "es_PE"
		await sendTemplateMessage.call(
			this.whatsappService,
			formattedPhone,
			name,
			parameters,
			langCode,
		);
		return name;
	}
}
