export const normalizePhone = (raw: string): string => {
	return raw.replace(/\D/g, "").replace(/^51/, "");
};