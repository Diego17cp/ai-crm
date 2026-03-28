import { EstadoGeneral, PrismaClient } from "generated/prisma/client";
import { IRoleRepository } from "../../application/ports/IRoleRepository";
import { RoleDTO } from "../../domain/dtos";

export class PrismaRolesRepository implements IRoleRepository {
    constructor(private readonly prisma: PrismaClient) {}
    async findAll(): Promise<RoleDTO[]> {
        const data = await this.prisma.roles.findMany({
            where: {
                estado: EstadoGeneral.ACTIVO
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return data;
    }
}