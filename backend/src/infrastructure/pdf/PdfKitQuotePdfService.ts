import PDFDocument from "pdfkit";
import path from "node:path";
import fs from "node:fs";
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
		white: "#FFFFFF",
	};

	async generate(data: QuotePdfData): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({
				size: "A4",
				margin: 40,
				bufferPages: true,
			});
			const chunks: Buffer[] = [];

			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			const contentWidth = doc.page.width - 80;

			doc.rect(0, 0, doc.page.width, 8).fill(this.COLORS.primary);

			doc.y = 35;
			doc.fillColor(this.COLORS.primary)
				.fontSize(20)
				.font("Helvetica-Bold")
				.text("PROPUESTA DE COTIZACIÓN", 40, 35);

			const fechaText = `Fecha: ${new Date().toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit" })}`;
			doc.fillColor(this.COLORS.textMuted)
				.fontSize(8.5)
				.font("Helvetica")
				.text(
					`Código: ${data.codigo || "N/A"}  |  ${fechaText}`,
					40,
					60,
				);

			this.drawDivider(doc, 40, 75, contentWidth);

			const infoBoxY = 85;
			const colWidth = (contentWidth - 15) / 2;
			const infoBoxHeight = 110;

			doc.roundedRect(40, infoBoxY, colWidth, infoBoxHeight, 5).fill(
				this.COLORS.bgLight,
			);
			doc.fillColor(this.COLORS.primary)
				.font("Helvetica-Bold")
				.fontSize(9.5)
				.text("DATOS GENERALES", 52, infoBoxY + 10);

			doc.font("Helvetica")
				.fontSize(8.5)
				.fillColor(this.COLORS.textMuted)
				.text("Cliente:", 52, infoBoxY + 28);
			doc.font("Helvetica-Bold")
				.fillColor(this.COLORS.textDark)
				.text(data.clienteNombre, 125, infoBoxY + 28, {
					width: colWidth - 135,
				});

			doc.font("Helvetica")
				.fontSize(8.5)
				.fillColor(this.COLORS.textMuted)
				.text("Proyecto:", 52, infoBoxY + 45);
			doc.font("Helvetica-Bold")
				.fillColor(this.COLORS.textDark)
				.text(data.proyectoNombre, 125, infoBoxY + 45, {
					width: colWidth - 135,
				});

			doc.font("Helvetica")
				.fontSize(8.5)
				.fillColor(this.COLORS.textMuted)
				.text("Distrito/Ubigeo:", 52, infoBoxY + 62);
			doc.font("Helvetica")
				.fillColor(this.COLORS.textDark)
				.text(
					data.ubigeoProyecto || "No especificado",
					125,
					infoBoxY + 62,
					{ width: colWidth - 135, height: 12, ellipsis: true },
				);
			doc.font("Helvetica")
				.fontSize(8.5)
				.fillColor(this.COLORS.textMuted)
				.text("Dirección:", 52, infoBoxY + 79);
			doc.font("Helvetica")
				.fillColor(this.COLORS.textDark)
				.text(
					data.ubicacionProyecto || "Vía de acceso al proyecto",
					125,
					infoBoxY + 79,
					{ width: colWidth - 135, ellipsis: true, height: 12 },
				);
			const col2X = 40 + colWidth + 15;
			doc.roundedRect(col2X, infoBoxY, colWidth, infoBoxHeight, 5).fill(
				this.COLORS.bgLight,
			);
			doc.fillColor(this.COLORS.primary)
				.font("Helvetica-Bold")
				.fontSize(9.5)
				.text("DETALLES DEL LOTE", col2X + 12, infoBoxY + 10);

			doc.font("Helvetica")
				.fontSize(8.5)
				.fillColor(this.COLORS.textMuted);
			doc.text("Identificador:", col2X + 12, infoBoxY + 28);
			doc.font("Helvetica-Bold")
				.fillColor(this.COLORS.primary)
				.text(data.loteIdentificador, col2X + 80, infoBoxY + 28);

			doc.font("Helvetica")
				.fillColor(this.COLORS.textMuted)
				.text("Área Total:", col2X + 12, infoBoxY + 45);
			doc.font("Helvetica-Bold")
				.fillColor(this.COLORS.textDark)
				.text(
					`${data.areaM2.toFixed(2)} m²`,
					col2X + 70,
					infoBoxY + 45,
				);

			doc.font("Helvetica")
				.fillColor(this.COLORS.textMuted)
				.text("Partida Reg.:", col2X + 12, infoBoxY + 62);
			doc.font("Helvetica")
				.fillColor(this.COLORS.textDark)
				.text(
					data.partidaRegistral || "En independización",
					col2X + 80,
					infoBoxY + 62,
				);

			doc.font("Helvetica")
				.fillColor(this.COLORS.textMuted)
				.text("Referencia:", col2X + 12, infoBoxY + 79);
			doc.font("Helvetica")
				.fillColor(this.COLORS.textDark)
				.text(
					data.referenciaLote ||
						"Ubicación preferencial dentro del plano",
					col2X + 72,
					infoBoxY + 79,
					{ width: colWidth - 85 },
				);

			let currentY = infoBoxY + infoBoxHeight + 15;
			const sortedImages = [...(data.imagenesLote || [])].sort(
				(a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0),
			);
			const mainImage = sortedImages[0];
			const resolvedMainPath = mainImage
				? this.resolveImagePath(mainImage.url)
				: null;

			if (resolvedMainPath) {
				const imgCardHeight = 135;
				doc.roundedRect(
					40,
					currentY,
					contentWidth,
					imgCardHeight,
					5,
				).fillAndStroke(this.COLORS.bgLight, this.COLORS.lines);

				const photoWidth = 190;
				const photoHeight = imgCardHeight - 16;
				try {
					doc.save();
					doc.roundedRect(
						48,
						currentY + 8,
						photoWidth,
						photoHeight,
						4,
					).clip();
					doc.image(resolvedMainPath, 48, currentY + 8, {
						fit: [photoWidth, photoHeight],
						align: "center",
						valign: "center",
					});
					doc.restore();
				} catch {
				}

				const photoInfoX = 48 + photoWidth + 15;
				doc.fillColor(this.COLORS.primary)
					.font("Helvetica-Bold")
					.fontSize(9)
					.text("VISTA DEL INMUEBLE", photoInfoX, currentY + 15);
				doc.fillColor(this.COLORS.textDark)
					.font("Helvetica-Bold")
					.fontSize(11)
					.text(
						mainImage?.descripcion ||
							`Lote ${data.loteIdentificador} - ${data.proyectoNombre}`,
						photoInfoX,
						currentY + 28,
						{ width: contentWidth - photoWidth - 40 },
					);

				doc.fillColor(this.COLORS.textMuted)
					.font("Helvetica")
					.fontSize(8)
					.text(
						"Fotografía referencial correspondiente al estado actual y topografía del lote.",
						photoInfoX,
						currentY + 48,
						{ width: contentWidth - photoWidth - 40 },
					);

				if (data.referenciaLote) {
					doc.roundedRect(
						photoInfoX,
						currentY + 75,
						contentWidth - photoWidth - 45,
						38,
						4,
					).fill(this.COLORS.white);
					doc.fillColor(this.COLORS.textMuted)
						.font("Helvetica")
						.fontSize(7.5)
						.text(
							"UBICACIÓN DESTACADA",
							photoInfoX + 8,
							currentY + 81,
						);
					doc.fillColor(this.COLORS.primary)
						.font("Helvetica-Bold")
						.fontSize(8.5)
						.text(
							data.referenciaLote,
							photoInfoX + 8,
							currentY + 93,
							{ width: contentWidth - photoWidth - 60 },
						);
				}

				currentY += imgCardHeight + 15;
			}

			doc.fillColor(this.COLORS.primary)
				.fontSize(11)
				.font("Helvetica-Bold")
				.text("RESUMEN FINANCIERO", 40, currentY);
			currentY += 16;

			this.drawTableDataRow(
				doc,
				40,
				currentY,
				contentWidth,
				"Precio de Lista Oficial",
				`S/ ${data.precioLista.toFixed(2)}`,
				false,
			);
			currentY += 22;

			const montoDescuento = data.precioLista - data.precioFinal;
			this.drawTableDataRow(
				doc,
				40,
				currentY,
				contentWidth,
				`Descuento Especial Aplicado (-${data.descuentoPorcentaje}%)`,
				`- S/ ${montoDescuento.toFixed(2)}`,
				true,
			);
			currentY += 22;

			doc.roundedRect(40, currentY, contentWidth, 32, 4).fill(
				this.COLORS.bgPrice,
			);
			doc.fillColor(this.COLORS.primary)
				.font("Helvetica-Bold")
				.fontSize(10)
				.text("PRECIO TOTAL NETO", 55, currentY + 11);
			doc.text(`S/ ${data.precioFinal.toFixed(2)}`, 40, currentY + 11, {
				align: "right",
				width: contentWidth - 15,
			});
			currentY += 42;

			doc.fillColor(this.COLORS.primary)
				.fontSize(11)
				.font("Helvetica-Bold")
				.text("MODALIDAD DE PAGO", 40, currentY);
			currentY += 16;

			if (data.tipoPago === "CREDITO") {
				const col3Width = (contentWidth - 20) / 3;

				doc.roundedRect(40, currentY, col3Width, 48, 4).fill(
					this.COLORS.bgLight,
				);
				doc.fillColor(this.COLORS.textMuted)
					.font("Helvetica")
					.fontSize(7.5)
					.text("CUOTA INICIAL", 50, currentY + 10);
				doc.fillColor(this.COLORS.textDark)
					.font("Helvetica-Bold")
					.fontSize(10.5)
					.text(
						`S/ ${data.cuotaInicial?.toFixed(2) || "0.00"}`,
						50,
						currentY + 24,
					);

				doc.roundedRect(
					40 + col3Width + 10,
					currentY,
					col3Width,
					48,
					4,
				).fill(this.COLORS.bgLight);
				doc.fillColor(this.COLORS.textMuted)
					.font("Helvetica")
					.fontSize(7.5)
					.text(
						"PLAZO DE FINANCIAMIENTO",
						50 + col3Width + 10,
						currentY + 10,
					);
				doc.fillColor(this.COLORS.textDark)
					.font("Helvetica-Bold")
					.fontSize(10.5)
					.text(
						`${data.numeroCuotas} Meses`,
						50 + col3Width + 10,
						currentY + 24,
					);

				doc.roundedRect(
					40 + col3Width * 2 + 20,
					currentY,
					col3Width,
					48,
					4,
				).fill(this.COLORS.bgPrice);
				doc.fillColor(this.COLORS.primary)
					.font("Helvetica")
					.fontSize(7.5)
					.text(
						"CUOTA MENSUAL ESTIMADA",
						50 + col3Width * 2 + 20,
						currentY + 10,
					);
				doc.fillColor(this.COLORS.primary)
					.font("Helvetica-Bold")
					.fontSize(10.5)
					.text(
						`S/ ${data.montoCuota?.toFixed(2) || "0.00"}`,
						50 + col3Width * 2 + 20,
						currentY + 24,
					);
			} else {
				doc.roundedRect(40, currentY, contentWidth, 34, 4).fill(
					this.COLORS.bgLight,
				);
				doc.fillColor(this.COLORS.primary)
					.font("Helvetica-Bold")
					.fontSize(9.5)
					.text(
						"✓ Pago al Contado (Cancelación al 100% con beneficio de escrituración inmediata)",
						55,
						currentY + 12,
					);
			}

			if (sortedImages.length > 1) {
				const secondaryImages = sortedImages.slice(1, 5);
				doc.addPage();
				doc.rect(0, 0, doc.page.width, 8).fill(this.COLORS.primary);

				doc.fillColor(this.COLORS.primary)
					.fontSize(16)
					.font("Helvetica-Bold")
					.text("ANEXO: REGISTRO FOTOGRÁFICO", 40, 35);
				doc.fillColor(this.COLORS.textMuted)
					.fontSize(8.5)
					.font("Helvetica")
					.text(
						`Lote ${data.loteIdentificador} | ${data.proyectoNombre}`,
						40,
						58,
					);
				this.drawDivider(doc, 40, 72, contentWidth);

				let gridY = 85;
				const gridColWidth = (contentWidth - 15) / 2;
				const gridColHeight = 140;

				secondaryImages.forEach((img, idx) => {
					const col = idx % 2;
					const row = Math.floor(idx / 2);
					const imgX = 40 + col * (gridColWidth + 15);
					const imgY = gridY + row * (gridColHeight + 25);

					const resolved = this.resolveImagePath(img.url);
					doc.roundedRect(
						imgX,
						imgY,
						gridColWidth,
						gridColHeight,
						4,
					).fillAndStroke(this.COLORS.bgLight, this.COLORS.lines);

					if (resolved) {
						try {
							doc.save();
							doc.roundedRect(
								imgX + 5,
								imgY + 5,
								gridColWidth - 10,
								gridColHeight - 28,
								4,
							).clip();
							doc.image(resolved, imgX + 5, imgY + 5, {
								fit: [gridColWidth - 10, gridColHeight - 28],
								align: "center",
								valign: "center",
							});
							doc.restore();
						} catch {}
					}

					doc.fillColor(this.COLORS.textDark)
						.font("Helvetica")
						.fontSize(7.5)
						.text(
							img.descripcion ||
								`Foto ${idx + 2} - Vista del Inmueble`,
							imgX + 6,
							imgY + gridColHeight - 16,
							{ width: gridColWidth - 12, ellipsis: true },
						);
				});
			}
			
			const totalPages = doc.bufferedPageRange().count;
			for (let i = 0; i < totalPages; i++) {
				doc.switchToPage(i);
				doc.page.margins.bottom = 0;

				const footerY = doc.page.height - 35;
				doc.moveTo(40, footerY - 8)
					.lineTo(doc.page.width - 40, footerY - 8)
					.strokeColor(this.COLORS.lines)
					.lineWidth(0.5)
					.stroke();

				doc.fillColor(this.COLORS.textMuted)
					.fontSize(7)
					.font("Helvetica")
					.text(
						"Este documento es una simulación económica comercial preliminar y no genera obligación contractual.",
						40,
						footerY,
						{ width: contentWidth - 70 },
					);

				doc.text(
					`Pág. ${i + 1} de ${totalPages}`,
					doc.page.width - 100,
					footerY,
					{ align: "right", width: 60 },
				);
			}

			doc.end();
		});
	}

	private resolveImagePath(imagePathOrUrl?: string): string | null {
		if (!imagePathOrUrl) return null;
		const filename = path.basename(imagePathOrUrl);
		const candidates = [
			path.join(process.cwd(), "public/uploads/lotes_imagenes", filename),
			path.join(process.cwd(), "public", imagePathOrUrl),
			path.join(process.cwd(), "public/uploads", filename),
			imagePathOrUrl,
		];
		for (const candidate of candidates) {
			if (fs.existsSync(candidate)) return candidate;
		}
		return null;
	}

	private drawDivider(
		doc: PDFKit.PDFDocument,
		x: number,
		y: number,
		width: number,
	): void {
		doc.moveTo(x, y)
			.lineTo(x + width, y)
			.strokeColor(this.COLORS.lines)
			.lineWidth(0.8)
			.stroke();
	}

	private drawTableDataRow(
		doc: PDFKit.PDFDocument,
		x: number,
		y: number,
		width: number,
		label: string,
		value: string,
		isAccent: boolean,
	): void {
		doc.fillColor(this.COLORS.textDark)
			.font("Helvetica")
			.fontSize(9)
			.text(label, x + 5, y + 2);
		doc.fillColor(isAccent ? this.COLORS.accent : this.COLORS.textDark)
			.font("Helvetica-Bold")
			.text(value, x, y + 2, { align: "right", width: width - 5 });

		doc.moveTo(x, y + 16)
			.lineTo(x + width, y + 16)
			.strokeColor(this.COLORS.lines)
			.lineWidth(0.5)
			.stroke();
	}
}
