import { PrismaClient } from "generated/prisma/client";
import { IAuthUserRepository } from "../../application/ports/IAuthUserRepository";
import { AuthUser } from "../../domain/AuthUser";

export class PrismaAuthUserRepository implements IAuthUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private mapToDomain(record: any): AuthUser {
        return new AuthUser({
            id: record.id,
            email: record.email,
            id_rol: record.id_rol,
            rol_nombre: record.rol?.nombre,
            nombres: record.nombres,
            apellidos: record.apellidos,
            telefono: record.telefono,
            estado: record.estado,
            password_hash: record.password_hash,
        });
    }

    async findByEmail(email: string): Promise<AuthUser | null> {
        const record = await this.prisma.usuarios.findUnique({
            where: { email },
            include: { rol: true }
        });
        return record ? this.mapToDomain(record) : null;
    }

    async findById(id: string): Promise<AuthUser | null> {
        const record = await this.prisma.usuarios.findUnique({ 
            where: { id },
            include: { rol: true }
        });
        return record ? this.mapToDomain(record) : null;
    }
}
