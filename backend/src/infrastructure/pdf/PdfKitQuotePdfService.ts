import PDFDocument from "pdfkit";
import { IQuotePdfService, QuotePdfData } from "@/core/pdf/IQuotePdfService";

export class PdfKitQuotePdfService implements IQuotePdfService {
	async generate(data: QuotePdfData): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({ margin: 50 });
			const chunks: Buffer[] = [];

			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			doc.fontSize(18).text("Cotización de Lote", { align: "center" });
			doc.moveDown();

			doc.fontSize(10).text(`Código: ${data.codigo}`);
			doc.text(`Cliente: ${data.clienteNombre}`);
			doc.text(`Proyecto: ${data.proyectoNombre}`);
			doc.text(
				`Lote: ${data.loteIdentificador}  |  Área: ${data.areaM2} m²`,
			);
			doc.moveDown();

			doc.fontSize(12).text(
				`Precio de lista: S/ ${data.precioLista.toFixed(2)}`,
			);
			doc.text(`Descuento aplicado: ${data.descuentoPorcentaje}%`);
			doc.text(`Precio final: S/ ${data.precioFinal.toFixed(2)}`, {
				underline: true,
			});
			doc.moveDown();

			if (data.tipoPago === "CREDITO") {
				doc.text(`Cuota inicial: S/ ${data.cuotaInicial?.toFixed(2)}`);
				doc.text(`Número de cuotas: ${data.numeroCuotas}`);
				doc.text(`Cuota mensual: S/ ${data.montoCuota?.toFixed(2)}`);
			} else {
				doc.text("Modalidad: Pago al contado");
			}

			doc.end();
		});
	}
}
