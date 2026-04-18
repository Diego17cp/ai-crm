import { Ventas, Cuotas, Prisma, Clientes, TelefonosCliente, Lotes, Manzanas, Etapas, Proyectos } from "generated/prisma/client";
import {
	GetSalesQueryDTO,
	PaginatedResult,
	GetCollectionsQueryDTO,
} from "../../domain/dtos";

export type CuotaWithRelations = Cuotas & {
	venta: Ventas & {
		cliente: Clientes & {
			telefonos: TelefonosCliente[];
		},
		lote: Lotes & {
			manzana: Manzanas & {
				etapa: Etapas & {
					proyecto: Proyectos;
				}
			}
		}
	}
}

export interface ISalesRepository {
	findPaginated(query: GetSalesQueryDTO): Promise<PaginatedResult<any>>;
	findById(id: number): Promise<any | null>;
	createSaleWithQuotas(
		data: Prisma.VentasCreateInput,
		cuotas: Prisma.CuotasCreateManyVentaInput[],
		loteId: number,
        clienteId: number,
	): Promise<Ventas>;
	payQuota(cuotaId: number, data: Prisma.CuotasUpdateInput): Promise<Cuotas>;
	findCollections(
		query: GetCollectionsQueryDTO,
	): Promise<PaginatedResult<any>>;
	getOverdueQuotas(): Promise<CuotaWithRelations[]>;
	findCuotaById(id: number): Promise<CuotaWithRelations | null>;
}
