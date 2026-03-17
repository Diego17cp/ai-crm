import { PrismaClient } from "generated/prisma/client";
import { IAuthUserRepository } from "../../application/ports/IAuthUserRepository";
import { AuthUser } from "../../domain/AuthUser";

export class PrismaAuthUserRepository implements IAuthUserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findByEmail(email: string): Promise<AuthUser | null> {
		const record = await this.prisma.usuarios.findUnique({
			where: { email },
		});
		return record ? new AuthUser(record) : null;
	}

	async findById(id: string): Promise<AuthUser | null> {
		const record = await this.prisma.usuarios.findUnique({ where: { id } });
		return record ? new AuthUser(record) : null;
	}
}
