import {
	PrismaClient,
	EstadoLote,
	Prisma,
	Lotes,
	LotesImagenes,
} from "generated/prisma/client";
import {
	ILotesRepository,
	LoteWithRelationsDTO,
} from "../../application/ports/ILotesRepository";
import {
	CreateImage,
	CreateLoteDTO,
	GetLotesQueryDTO,
	PaginatedLotesResult,
	UpdateLoteDTO,
} from "../../domain/dtos";
import { generateNestedSearchCondition } from "@/shared/utils/prismaSearch";

export class PrismaLotesRepository implements ILotesRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findPaginated(
		queryDTO: GetLotesQueryDTO,
	): Promise<PaginatedLotesResult<LoteWithRelationsDTO>> {
		const {
			q,
			page,
			limit,
			id_proyecto,
			id_etapa,
			id_manzana,
			estado,
			area,
			precio_total_min,
			precio_m2_min,
		} = queryDTO;
		const skip = (page - 1) * limit;

		const whereCondition: Prisma.LotesWhereInput = {};
		if (estado) whereCondition.estado = estado;
		if (id_manzana) whereCondition.id_manzana = id_manzana;
		if (id_etapa) whereCondition.manzana = { id_etapa: id_etapa };
		if (id_proyecto)
			whereCondition.manzana = { etapa: { id_proyecto: id_proyecto } };

		if (precio_total_min) {
			whereCondition.precio_total = {
				gte: String(precio_total_min),
			};
		}

		if (precio_m2_min) {
			whereCondition.precio_m2 = {
				gte: String(precio_m2_min),
			};
		}

		if (area) {
			whereCondition.area_m2 = { gte: String(area) };
		}

		if (q && q.trim() !== "") {
			whereCondition.AND = generateNestedSearchCondition(q, (word) => [
				{ numero_lote: { contains: word, mode: "insensitive" } },
				{ numero_partida: { contains: word, mode: "insensitive" } },
				{
					ubicacion_referencial: {
						contains: word,
						mode: "insensitive",
					},
				},
				{
					manzana: {
						codigo: { contains: word, mode: "insensitive" },
					},
				},
				{
					manzana: {
						etapa: {
							nombre: { contains: word, mode: "insensitive" },
						},
					},
				},
				{
					manzana: {
						etapa: {
							proyecto: {
								nombre: { contains: word, mode: "insensitive" },
							},
						},
					},
				},
			]);
		}
		const [total, lotesData] = await Promise.all([
			this.prisma.lotes.count({ where: whereCondition }),
			this.prisma.lotes.findMany({
				where: whereCondition,
				skip,
				take: limit,
				orderBy: {
					id: "desc",
				},
				include: {
					imagenes: true,
					manzana: {
						select: {
							codigo: true,
							etapa: {
								select: {
									nombre: true,
									proyecto: {
										select: {
											nombre: true,
										},
									},
								},
							},
						},
					},
				},
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		const data = lotesData.map((lt) => ({
			...lt,
			imagenes: [
				...lt.imagenes.sort((a, b) => {
					if (a.es_principal && !b.es_principal) return -1;
					if (!a.es_principal && b.es_principal) return 1;
					return 0;
				}),
			],
		}));

		return {
			data: data as unknown as LoteWithRelationsDTO[],
			meta: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		};
	}

	async findById(id: number): Promise<LoteWithRelationsDTO | null> {
		return this.prisma.lotes.findFirst({
			where: { id },
			include: {
				imagenes: true,
				manzana: {
					select: {
						codigo: true,
						etapa: {
							select: {
								nombre: true,
								proyecto: {
									select: { nombre: true },
								},
							},
						},
					},
				},
			},
		}) as unknown as Promise<LoteWithRelationsDTO | null>;
	}

	async create(data: CreateLoteDTO): Promise<Lotes> {
		return this.prisma.lotes.create({
			data: {
				...data,
				estado: data.estado || EstadoLote.Disponible,
			},
		});
	}

	async createWithImages(
		data: CreateLoteDTO,
		imagenes: CreateImage[],
	): Promise<Lotes & { imagenes: LotesImagenes[] }> {
		return this.prisma.$transaction(async (tx) => {
			const lote = await tx.lotes.create({
				data: { ...data, estado: data.estado || EstadoLote.Disponible },
			});
			if (imagenes.length > 0) {
				await tx.lotesImagenes.createMany({
					data: imagenes.map((img) => ({
						id_lote: lote.id,
						url_imagen: img.url_image,
						es_principal: img.es_principal,
					})),
				});
			}
			return tx.lotes.findUniqueOrThrow({
				where: { id: lote.id },
				include: { imagenes: true },
			});
		});
	}

	async update(
		id: number,
		data: UpdateLoteDTO,
		newFiles: Express.Multer.File[] = [],
	): Promise<Lotes & { imagenes: LotesImagenes[] }> {
		const { images, ...fields } = data;
		return this.prisma.$transaction(async (tx) => {
			if (Object.keys(fields).length > 0)
				await tx.lotes.update({ where: { id }, data: fields });
			if (images?.remove && images.remove.length > 0)
				await tx.lotesImagenes.deleteMany({
					where: { id: { in: images.remove }, id_lote: id },
				});
			let newIds: number[] = [];
			if (newFiles.length > 0) {
				for (const file of newFiles) {
					const created = await tx.lotesImagenes.create({
						data: {
							id_lote: id,
							url_imagen: file.filename,
							es_principal: false,
						},
					});
					newIds.push(created.id);
				}
			}
			let finalMainId: number | undefined;
			if (images?.mark_main !== undefined) finalMainId = images.mark_main;
			else if (
				images?.mark_new_main !== undefined &&
				newIds[images.mark_new_main] !== undefined
			)
				finalMainId = newIds[images.mark_new_main];

			if (finalMainId !== undefined) {
				await tx.lotesImagenes.updateMany({
					where: { id_lote: id },
					data: {
						es_principal: false,
					},
				});
				await tx.lotesImagenes.update({
					where: { id: finalMainId },
					data: {
						es_principal: true,
					},
				});
			} else {
				const main = await tx.lotesImagenes.findFirst({
					where: { id_lote: id, es_principal: true },
				});
				if (!main) {
					const first = await tx.lotesImagenes.findFirst({
						where: { id_lote: id },
						orderBy: { id: "asc" },
					});
					if (first)
						await tx.lotesImagenes.update({
							where: { id: first.id },
							data: {
								es_principal: true,
							},
						});
				}
			}
			return tx.lotes.findUniqueOrThrow({
				where: { id },
				include: { imagenes: true },
			});
		});
	}

	async delete(id: number): Promise<any> {
		return this.prisma.lotes.delete({
			where: { id },
		});
	}

	async hasSales(id: number): Promise<boolean> {
		const salesCount = await this.prisma.ventas.count({
			where: { id_lote: id },
		});
		return salesCount > 0;
	}
}
