import { PrismaClient } from "generated/prisma/client";
import { IUbigeosRepository } from "../../application/ports/IUbigeosRepository";

export class PrismaUbigeosRepository implements IUbigeosRepository {
    constructor(private readonly prisma: PrismaClient) {}
    async findAll() {
        const ubigeos = await this.prisma.ubigeos.findMany({
            select: { id: true, nombre: true }
        });
        return ubigeos;
    }
}