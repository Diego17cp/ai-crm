import {
	CreateLeadDTO,
	GetLeadsQueryDTO,
	UpdateLeadDTO,
} from "@/modules/leads/domain/dtos";
import { IClientsRepository } from "../ports/IClientsRepository";
import { AppError } from "@/core/errors/AppError";

const parseNullableString = (value?: string | null): string | undefined => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};

export class ClientsUseCases {
	constructor(private readonly repo: IClientsRepository) {}

	async getAllClients(query: GetLeadsQueryDTO) {
		return this.repo.findPaginated(query);
	}

	async getClientById(id: number) {
		if (isNaN(id) || id <= 0)
			throw new AppError("ID de Cliente inválido", 400);

		const client = await this.repo.findById(id);
		if (!client) throw new AppError("Cliente no encontrado", 404);

		return client;
	}

	async createClient(data: CreateLeadDTO) {
		if (!data.id_tipo_doc_identidad)
			throw new AppError("El tipo de documento es requerido", 400);
		if (!data.numero || data.numero.trim() === "")
			throw new AppError("El número de documento es requerido", 400);
        const existingClient = await this.repo.findByDocument(data.id_tipo_doc_identidad, data.numero.trim());
        if (existingClient) throw new AppError(`El documento ${data.numero} ya se encuentra registrado.`, 409);
        let validPhones = undefined;
        if (data.telefonos && Array.isArray(data.telefonos)) {
            validPhones = data.telefonos
                .filter(t => t.numero && t.numero.trim() !== "")
                .map(t => ({
                    ...t,
                    numero: t.numero.trim(),
                }));
            const numeros = validPhones.map(t => t.numero);
            const phonesInUse = await this.repo.findPhonesInUse(numeros);
            if (phonesInUse.length > 0) throw new AppError(`Los siguientes números de teléfono ya se encuentran en uso: ${phonesInUse.join(", ")}`, 409);
        }
        let parsedDate = undefined;
        if (data.fecha_nacimiento) {
            parsedDate = new Date(data.fecha_nacimiento);
            if (isNaN(parsedDate.getTime())) {
                throw new AppError("Fecha de nacimiento inválida", 400);
            }
        }
		const payload = {
			...data,
			numero: data.numero.trim(),
            nombres: parseNullableString(data.nombres),
            apellidos: parseNullableString(data.apellidos),
            email: parseNullableString(data.email)?.toLowerCase(),
            nacionalidad: parseNullableString(data.nacionalidad),
            direccion: parseNullableString(data.direccion),
            ocupacion: parseNullableString(data.ocupacion),
            fecha_nacimiento: parsedDate,
            telefonos: validPhones,
		};
		return this.repo.create(payload);
	}

	async updateClient(id: number, data: UpdateLeadDTO) {
		if (isNaN(id) || id <= 0)
			throw new AppError("ID de Cliente inválido", 400);

		const existing = await this.repo.findById(id);
		if (!existing) throw new AppError("Cliente no encontrado", 404);

        if (data.fecha_nacimiento !== undefined) {
            if (data.fecha_nacimiento === null || String(data.fecha_nacimiento).trim() === "") {
                data.fecha_nacimiento = null;
            } else {
                const parsedDate = new Date(data.fecha_nacimiento);
                if (isNaN(parsedDate.getTime())) {
                    throw new AppError("Fecha de nacimiento inválida", 400);
                }
                data.fecha_nacimiento = parsedDate;
            }
        }

        if (data.id_tipo_doc_identidad || data.numero) {
            const checkDocType = data.id_tipo_doc_identidad ?? existing.id_tipo_doc_identidad;
            const checkNum = data.numero ? data.numero.trim() : existing.numero;
            
            const clientDocDuplicate = await this.repo.findByDocument(checkDocType, checkNum);
            
            if (clientDocDuplicate && clientDocDuplicate.id !== id) throw new AppError(`El documento ${checkNum} ya se encuentra registrado en otro cliente.`, 409);
        }

        if (data.telefonos) {
            const { add, remove, update } = data.telefonos;
            const phonesToValidate: string[] = [];
            if (remove && Array.isArray(remove)) {
                for (const telId of remove) {
                    const belongsToClient = existing.telefonos.some(t => t.id === telId);
                    if (!belongsToClient) throw new AppError(`El teléfono con ID ${telId} no pertenece al Cliente`, 400);
                }
            }
            if (update && Array.isArray(update)) {
                for (const tel of update) {
                    if (!tel.id) throw new AppError("ID de teléfono es requerido para actualización", 400);
                    const belongsToClient = existing.telefonos.some(t => t.id === tel.id);
                    if (!belongsToClient) throw new AppError(`El teléfono con ID ${tel.id} no pertenece al Cliente`, 400);
                    if (tel.numero && tel.numero.trim() !== "") phonesToValidate.push(tel.numero.trim());
                }
            }
            if (add && Array.isArray(add)) {
                data.telefonos.add = add
                    .filter(t => t.numero && t.numero.trim() !== "")
                    .map(t => {
                        const trimmedNum = t.numero.trim();
                        phonesToValidate.push(trimmedNum);
                        return {
                            ...t,
                            numero: trimmedNum
                        };
                    });
            }
            if (phonesToValidate.length > 0) {
                const phonesInUse = await this.repo.findPhonesInUse(phonesToValidate, id);
                if (phonesInUse.length > 0) throw new AppError(`Los siguientes números de teléfono ya se encuentran en uso: ${phonesInUse.join(", ")}`, 409);
            }
        }

        if (data.nombres !== undefined) data.nombres = parseNullableString(data.nombres);
        if (data.apellidos !== undefined) data.apellidos = parseNullableString(data.apellidos);
        if (data.nacionalidad !== undefined) data.nacionalidad = parseNullableString(data.nacionalidad);
        if (data.direccion !== undefined) data.direccion = parseNullableString(data.direccion);
        if (data.ocupacion !== undefined) data.ocupacion = parseNullableString(data.ocupacion);
        
        if (data.email !== undefined) {
            const cleanEmail = parseNullableString(data.email);
            data.email = cleanEmail ? cleanEmail.toLowerCase() : null;
        }

		return this.repo.update(id, data);
	}

    async deleteClient(id: number) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de Cliente inválido", 400);
        const existing = await this.repo.findById(id);
        if (!existing) throw new AppError("Cliente no encontrado", 404);
        return this.repo.delete(id);
    }
}