import {
	Ventas,
	Cuotas,
	Prisma,
	Clientes,
	TelefonosPersona,
	Lotes,
	Manzanas,
	Etapas,
	Proyectos,
	Personas,
} from "generated/prisma/client";
import {
	GetSalesQueryDTO,
	PaginatedResult,
	GetCollectionsQueryDTO,
	ReminderLevel,
} from "../../domain/dtos";

export type CuotaWithRelations = Cuotas & {
	venta: Ventas & {
		cliente: Clientes & {
			persona: Personas & {
				telefonos: TelefonosPersona[];
			};
		};
		lote: Lotes & {
			manzana: Manzanas & {
				etapa: Etapas & {
					proyecto: Proyectos;
				};
			};
		};
	};
};

export interface ISalesRepository {
	findPaginated(query: GetSalesQueryDTO): Promise<PaginatedResult<any>>;
	findById(id: number): Promise<any | null>;
	createSaleWithQuotas(
		tx: Prisma.TransactionClient | undefined,
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
	logReminder(data: {
		id_cuota: number;
		id_usuario: string | null;
		template: string;
		telefono_destino: string;
		nivel_urgencia: ReminderLevel;
		es_automatica: boolean;
	}): Promise<void>;
}
