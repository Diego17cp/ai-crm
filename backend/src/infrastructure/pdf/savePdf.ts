import { env } from "@/config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const saveQuotePdf = (buffer: Buffer, code: string): string => {
	const dir = join(process.cwd(), "uploads", "cotizaciones");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

	const fileName = `${code}.pdf`;
	writeFileSync(join(dir, fileName), buffer);

	return `${env.API_URL}/uploads/cotizaciones/${fileName}`;
};
