import { PrismaClient } from "generated/prisma/client";
import { IUserRepository } from "../../application/ports/IUserRepository";
import { User } from "../../domain/User";

export class PrismaUserRepository implements IUserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	private mapToDomain(record: any): User {
		return new User(record);
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
