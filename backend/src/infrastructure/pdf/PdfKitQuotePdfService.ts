import PDFDocument from "pdfkit";
import { IQuotePdfService, QuotePdfData } from "@/core/pdf/IQuotePdfService";

export class PdfKitQuotePdfService implements IQuotePdfService {
	private readonly COLORS = {
		primary: "#005F41",         
		accent: "#00A878",          
		bgLight: "#F4F7F5",         
		bgPrice: "#E6F4EA",         
		textDark: "#111827",        
		textMuted: "#6B7280",       
		lines: "#E5E7EB",           
	};

	async generate(data: QuotePdfData): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({ 
				size: "A4", 
				margin: 50,
				bufferPages: true 
			});
			const chunks: Buffer[] = [];

			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			const contentWidth = doc.page.width - 100; 

			doc.rect(0, 0, doc.page.width, 8).fill(this.COLORS.primary);
			doc.y = 45; 

			doc.fillColor(this.COLORS.primary)
				.fontSize(22)
				.font("Helvetica-Bold")
				.text("COTIZACIÓN DE LOTE", 50, 45);
			
			doc.fillColor(this.COLORS.textMuted)
				.fontSize(9)
				.font("Helvetica")
				.text(`Código: ${data.codigo || "N/A"}`)
				.moveDown(1.5);

			this.drawDivider(doc, contentWidth);

			const infoBoxY = doc.y;
			const infoBoxHeight = 75;
			
			doc.roundedRect(50, infoBoxY, contentWidth, infoBoxHeight, 6)
				.fill(this.COLORS.bgLight);

			doc.fillColor(this.COLORS.textDark).font("Helvetica-Bold").fontSize(10).text("Información del Cliente", 65, infoBoxY + 12);
			doc.font("Helvetica").fillColor(this.COLORS.textMuted).text(`Nombre: `, 65, infoBoxY + 28);
			doc.font("Helvetica-Bold").fillColor(this.COLORS.textDark).text(data.clienteNombre, 115, infoBoxY + 28);

			doc.fillColor(this.COLORS.textDark).font("Helvetica-Bold").text("Detalles del Inmueble", 310, infoBoxY + 12);
			doc.font("Helvetica").fillColor(this.COLORS.textMuted).text(`Proyecto: ${data.proyectoNombre}`, 310, infoBoxY + 28);
			doc.text(`Identificador: ${data.loteIdentificador}`, 310, infoBoxY + 43);
			doc.text(`Área Total: ${data.areaM2} m²`, 310, infoBoxY + 58);

			doc.x = 50;
			doc.y = infoBoxY + infoBoxHeight + 20;

			doc.fillColor(this.COLORS.primary)
				.fontSize(12)
				.font("Helvetica-Bold")
				.text("Detalle Financiero")
				.moveDown(0.8);

			this.drawTableDataRow(doc, contentWidth, "Precio de Lista", `S/ ${data.precioLista.toFixed(2)}`, false);
			this.drawTableDataRow(doc, contentWidth, `Descuento Aplicado (-${data.descuentoPorcentaje}%)`, `- S/ ${(data.precioLista - data.precioFinal).toFixed(2)}`, true);
			
			const priceBoxY = doc.y + 5;
			doc.roundedRect(50, priceBoxY, contentWidth, 36, 4)
				.fill(this.COLORS.bgPrice);

			doc.fillColor(this.COLORS.primary).font("Helvetica-Bold").fontSize(11);
			doc.text("Precio Final Neto", 65, priceBoxY + 13);
			doc.text(`S/ ${data.precioFinal.toFixed(2)}`, 50, priceBoxY + 13, { align: "right", width: contentWidth - 15 });

			doc.x = 50;
			doc.y = priceBoxY + 55; 

			doc.fillColor(this.COLORS.primary)
				.fontSize(12)
				.font("Helvetica-Bold")
				.text("Modalidad de Pago Seleccionada")
				.moveDown(0.8);

			if (data.tipoPago === "CREDITO") {
				const gridY = doc.y;
				const colWidth = (contentWidth - 20) / 3;

				doc.roundedRect(50, gridY, colWidth, 50, 4).fill(this.COLORS.bgLight);
				doc.fillColor(this.COLORS.textMuted).font("Helvetica").fontSize(8).text("CUOTA INICIAL", 60, gridY + 12);
				doc.fillColor(this.COLORS.textDark).font("Helvetica-Bold").fontSize(11).text(`S/ ${data.cuotaInicial?.toFixed(2) || "0.00"}`, 60, gridY + 26);

				doc.roundedRect(50 + colWidth + 10, gridY, colWidth, 50, 4).fill(this.COLORS.bgLight);
				doc.fillColor(this.COLORS.textMuted).font("Helvetica").fontSize(8).text("PLAZO TOTAL", 60 + colWidth + 10, gridY + 12);
				doc.fillColor(this.COLORS.textDark).font("Helvetica-Bold").fontSize(11).text(`${data.numeroCuotas} Meses`, 60 + colWidth + 10, gridY + 26);

				doc.roundedRect(50 + (colWidth * 2) + 20, gridY, colWidth, 50, 4).fill(this.COLORS.bgPrice);
				doc.fillColor(this.COLORS.primary).font("Helvetica").fontSize(8).text("CUOTA MENSUAL FIJA", 60 + (colWidth * 2) + 20, gridY + 12);
				doc.fillColor(this.COLORS.primary).font("Helvetica-Bold").fontSize(11).text(`S/ ${data.montoCuota?.toFixed(2) || "0.00"}`, 60 + (colWidth * 2) + 20, gridY + 26);

				doc.y = gridY + 70;
			} else {
				const cashY = doc.y;
				doc.roundedRect(50, cashY, contentWidth, 35, 4).fill(this.COLORS.bgLight);
				doc.fillColor(this.COLORS.primary).font("Helvetica-Bold").fontSize(10).text("✓ Pago al Contado (Liquidación inmediata)", 65, cashY + 13);
				doc.y = cashY + 55;
			}

			const totalPages = doc.bufferedPageRange().count;
			
			for (let i = 0; i < totalPages; i++) {
				doc.switchToPage(i);
				
				doc.page.margins.bottom = 0; 

				const footerY = doc.page.height - 45;

				doc.moveTo(50, footerY - 8)
					.lineTo(doc.page.width - 50, footerY - 8)
					.strokeColor(this.COLORS.lines)
					.lineWidth(0.5)
					.stroke();

				doc.fillColor(this.COLORS.textMuted)
					.fontSize(7.5)
					.font("Helvetica")
					.text(
						"Este documento representa una simulación económica de lote y no constituye un compromiso legal contractual.", 
						50, 
						footerY, 
						{ width: contentWidth - 70, lineGap: 2 }
					);

				doc.text(
					`Pág. ${i + 1} de ${totalPages}`, 
					doc.page.width - 110, 
					footerY, 
					{ align: "right", width: 60 }
				);
			}

			doc.end();
		});
	}

	private drawDivider(doc: PDFKit.PDFDocument, width: number): void {
		doc.moveTo(50, doc.y)
			.lineTo(50 + width, doc.y)
			.strokeColor(this.COLORS.lines)
			.lineWidth(1)
			.stroke()
			.moveDown(1.2);
	}

	private drawTableDataRow(doc: PDFKit.PDFDocument, width: number, label: string, value: string, isAccent: boolean): void {
		const currentY = doc.y;
		
		doc.fillColor(this.COLORS.textDark).font("Helvetica").fontSize(10).text(label, 55, currentY + 6);
		doc.fillColor(isAccent ? this.COLORS.accent : this.COLORS.textDark)
			.font("Helvetica-Bold")
			.text(value, 50, currentY + 6, { align: "right", width: width - 10 });
		
		doc.moveTo(55, currentY + 22)
			.lineTo(50 + width, currentY + 22)
			.strokeColor(this.COLORS.lines)
			.lineWidth(0.5)
			.stroke();

		doc.y = currentY + 26; 
	}
}
