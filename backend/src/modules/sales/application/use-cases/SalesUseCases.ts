import { ISalesRepository } from "../ports/ISalesRepository";
import {
	CreateSaleDTO,
	PayQuotaDTO,
	GetSalesQueryDTO,
	GetCollectionsQueryDTO,
} from "../../domain/dtos";
import { AppError } from "@/core/errors/AppError";
import {
	EstadoCuota,
	EstadoVenta,
	EstadoContrato,
	TipoPago,
	Prisma,
} from "generated/prisma/client";

export class SalesUseCases {
	constructor(private readonly repo: ISalesRepository) {}

	async getAllSales(query: GetSalesQueryDTO) {
		const result = await this.repo.findPaginated(query);
        const formatted = result.data.map((sale: any) => {
            const cuotas_pendientes = sale._count?.cuotas ?? 0;
            const { _count, ...saleData } = sale;
            return { ...saleData, cuotas_pendientes };
        });
        return { data: formatted, meta: result.meta };
	}

	async getSaleById(id: number) {
		if (isNaN(id) || id <= 0) throw new AppError("ID de Venta inválido", 400);
		const sale = await this.repo.findById(id);
		if (!sale) throw new AppError("Venta no encontrada", 404);
		return sale;
	}

	async processCollectionBoard(query: GetCollectionsQueryDTO) {
		const collections = await this.repo.findCollections(query);
		const hoyString = new Date().toISOString().split("T")[0];
		const hoyTime = new Date(hoyString || "").getTime();

		const enrichedData = collections.data.map((c: any) => {
			const vencimiento = new Date(c.fecha_vencimiento).getTime();
			let dias_mora = 0;
			if (vencimiento < hoyTime) dias_mora = Math.ceil((hoyTime - vencimiento) / (1000 * 3600 * 24));
			return { ...c, dias_mora };
		});

		return { data: enrichedData, meta: collections.meta };
	}

	async createSale(data: CreateSaleDTO) {
		if (!data.id_lote || !data.id_cliente || !data.monto_total) throw new AppError("Lote, Cliente y Monto total son obligatorios", 400,);
		let cuotasToCreate: Prisma.CuotasCreateManyVentaInput[] = [];
		const isCredito = data.tipo_pago === TipoPago.CREDITO;
		let monto_cuota = null;

		if (isCredito) {
			if (!data.num_cuotas || data.num_cuotas <= 0)
				throw new AppError(
					"El número de cuotas es requerido en pagos a crédito",
					400,
				);
			if (!data.dia_pago || data.dia_pago < 1 || data.dia_pago > 28) throw new AppError("Día de pago inválido (1-28)", 400);

			const inicial = data.cuota_inicial || 0;
			if (inicial >= data.monto_total)
				throw new AppError(
					"La cuota inicial no puede ser mayor o igual al monto total",
					400,
				);

			const capitalFinanciable = data.monto_total - inicial;
			monto_cuota = capitalFinanciable / data.num_cuotas;

			const mesesGracia = data.meses_gracia || 0;

			const baseDate = new Date();
			baseDate.setMonth(baseDate.getMonth() + mesesGracia);

			for (let i = 1; i <= data.num_cuotas; i++) {
				const fechaVencimiento = new Date(
					baseDate.getFullYear(),
					baseDate.getMonth() + i,
					data.dia_pago,
				);

				cuotasToCreate.push({
					numero_cuota: i,
					monto_cuota,
					fecha_vencimiento: fechaVencimiento,
					estado: EstadoCuota.PENDIENTE,
				});
			}
		}

		const salePayload: Prisma.VentasCreateInput = {
			fecha_venta: data.fecha_venta
				? new Date(data.fecha_venta)
				: new Date(),
			monto_total: data.monto_total,
			cuota_inicial: isCredito ? data.cuota_inicial || 0 : 0,
			tipo_pago: data.tipo_pago,
			num_cuotas: isCredito ? data.num_cuotas : null,
			monto_cuota,
			tasa_interes: data.tasa_interes || null,
			dia_pago: data.dia_pago || null,
			meses_gracia: data.meses_gracia || 0,
			estado: !isCredito ? EstadoVenta.FINALIZADA : EstadoVenta.PENDIENTE,
			estado_contrato: data.estado_contrato || EstadoContrato.FIRMADO,
			lote: { connect: { id: data.id_lote } },
			cliente: { connect: { id: data.id_cliente } },
		};

		try {
			const newSale = await this.repo.createSaleWithQuotas(
				salePayload,
				cuotasToCreate,
				data.id_lote,
                data.id_cliente,
			);
			return newSale;
		} catch (error: any) {
			if (error.message.includes("RACE_CONDITION")) throw new AppError(error.message, 409);
			throw error;
		}
	}

	async payQuota(idCuota: number, data: PayQuotaDTO) {
		if (isNaN(idCuota) || idCuota <= 0) throw new AppError("ID de cuota inválido", 400);
		if (!data.metodo_pago) throw new AppError("Método de pago requerido", 400);

		const comprobanteUrlTest = "url_pendiente_upload.jpg";

		const updatePayload: Prisma.CuotasUpdateInput = {
			estado: EstadoCuota.PAGADO,
			fecha_pago: new Date(),
			comprobante_url: comprobanteUrlTest,
			metodo_pago: data.metodo_pago,
		};

		return this.repo.payQuota(idCuota, updatePayload);
	}
}
