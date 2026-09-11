const RESPUESTAS_ESPERANDO_ASESOR = [
	"Ya notifiqué a un asesor sobre tu solicitud, en breve se pondrá en contacto contigo. Gracias por tu paciencia 🙏",
	"Tu conversación ya está en la cola de nuestros asesores. Alguien te atenderá muy pronto.",
];

const RESPUESTAS_ATENDIDO_HUMANO = [
	"Un asesor ya está atendiendo tu conversación. Recibí tu mensaje y en breve te responderá.",
	"Recibido, un asesor está revisando tu mensaje en este momento.",
];

export function pickRespuestaEnEspera(
	estado: "ESPERANDO_ASESOR" | "ATENDIDO_HUMANO",
): string {
	const opciones =
		estado === "ESPERANDO_ASESOR"
			? RESPUESTAS_ESPERANDO_ASESOR
			: RESPUESTAS_ATENDIDO_HUMANO;
	return opciones[Math.floor(Math.random() * opciones.length)]!;
}
