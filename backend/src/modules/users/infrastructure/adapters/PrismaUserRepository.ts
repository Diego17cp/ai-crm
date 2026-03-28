import { Prisma, PrismaClient } from "generated/prisma/client";
import { IUserRepository } from "../../application/ports/IUserRepository";
import { User } from "../../domain/User";
import { GetUsersQueryDTO, PaginatedUsersResult, UserDTO } from "../../application/dtos/UserDTOs";

export class PrismaUserRepository implements IUserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	private mapToDomain(record: any): User {
		return new User(record);
	}

	async findAll(query: GetUsersQueryDTO): Promise<PaginatedUsersResult<UserDTO>> {
		const { page, limit, estado, id_rol, q } = query;
		const skip = (page - 1) * limit;
		const whereCondition: Prisma.UsuariosWhereInput = {};
		if (estado) whereCondition.estado = estado;
		if (id_rol) whereCondition.id_rol = id_rol;
		if (q && q.trim() !== "") {
			whereCondition.OR = [
				{ nombres: { contains: q, mode: "insensitive" } },
				{ apellidos: { contains: q, mode: "insensitive" } },
				{ email: { contains: q, mode: "insensitive" } },
				{ dni: { contains: q, mode: "insensitive" } },
				{ telefono: { contains: q, mode: "insensitive" } },
			]
		}
		const [total, records] = await Promise.all([
			this.prisma.usuarios.count({ where: whereCondition }),
			this.prisma.usuarios.findMany({
				where: whereCondition,
				skip,
				take: limit,
				orderBy: { created_at: "desc" },
				include: {
					rol: true
				}
			})
		]);
		const totalPages = Math.ceil(total / limit);
		const data = records.map(r => ({
			id: r.id,
			rol: {
				id: r.rol.id,
				nombre: r.rol.nombre
			},
			dni: r.dni,
			nombres: r.nombres,
			apellidos: r.apellidos,
			email: r.email,
			telefono: r.telefono,
			estado: r.estado,
			ultimo_login: r.ultimo_login,
			created_at: r.created_at,
			updated_at: r.updated_at,
		}))
		return {
			data,
			meta: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			}
		}
	}

	async findById(id: string): Promise<User | null> {
		const record = await this.prisma.usuarios.findUnique({ where: { id } });
		return record ? this.mapToDomain(record) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const record = await this.prisma.usuarios.findUnique({
			where: { email },
		});
		return record ? this.mapToDomain(record) : null;
	}

	async findByPhone(phone: string): Promise<User | null> {
		const record = await this.prisma.usuarios.findFirst({
			where: { telefono: phone },
		});
		return record ? this.mapToDomain(record) : null;
	}

	async create(user: User): Promise<User> {
		const record = await this.prisma.usuarios.create({
			data: user.props as any,
		});
		return this.mapToDomain(record);
	}

	async update(id: string, user: Partial<User>): Promise<User> {
		const record = await this.prisma.usuarios.update({
			where: { id },
			data: user.props as any,
		});
		return this.mapToDomain(record);
	}

	async delete(id: string): Promise<void> {
		await this.prisma.usuarios.update({
			where: { id },
			data: { estado: "INACTIVO" },
		});
	}
}
