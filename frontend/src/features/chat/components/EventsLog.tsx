import { FiActivity } from "react-icons/fi";
import { formatChatDate } from "../utils/chatFormatters";
import type { EventChat } from "../types";

const EVENTO_LABELS: Record<string, string> = {
	INICIADA: "Conversación iniciada",
	MENSAJE_RECIBIDO: "Mensaje del cliente",
	MENSAJE_ENVIADO: "Mensaje del asesor",
	BOT_RESPONDE: "Respuesta del bot",
	TRANSFERIDA_A_HUMANO: "Transferida a asesor humano",
	ASESOR_ASIGNADO: "Asesor asignado",
	CITA_CREADA: "Cita agendada",
	COTIZACION_CREADA: "Cotización generada",
	FINALIZADA: "Conversación finalizada",
};

export const EventsLog = ({ eventos }: { eventos: EventChat[] }) => {
	if (eventos.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
				<FiActivity size={32} className="mb-2 opacity-50" />
				Sin eventos registrados
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{eventos.map((ev) => (
				<div key={ev.id} className="flex gap-3 items-start">
					<div className="size-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
					<div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-3">
						<div className="flex justify-between items-center">
							<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
								{EVENTO_LABELS[ev.tipo] ?? ev.tipo}
							</p>
							<span className="text-xs text-gray-400">{formatChatDate(ev.created_at)}</span>
						</div>
						{ev.usuario && (
							<p className="text-xs text-gray-500 mt-0.5">
								Por: {ev.usuario.nombres} {ev.usuario.apellidos}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
};