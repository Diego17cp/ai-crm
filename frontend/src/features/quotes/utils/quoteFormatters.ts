export const formatQuoteDate = (dateString: string) => {
	if (!dateString) return "Sin fecha";
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("es-PE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};
