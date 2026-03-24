import { Ventas, Cuotas, Prisma } from "generated/prisma/client";
import {
	GetSalesQueryDTO,
	PaginatedResult,
	GetCollectionsQueryDTO,
} from "../../domain/dtos";

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
}
