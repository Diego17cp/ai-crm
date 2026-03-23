import { IAppointmentsRepository } from "../ports/IAppointmentsRepository";
import { CreateAppointmentDTO, GetAppointmentsQueryDTO, UpdateAppointmentDTO } from "../../domain/dtos";
import { AppError } from "@/core/errors/AppError";

const parseHoraCita = (horaStr: string | Date): Date => {
    if (horaStr instanceof Date) return horaStr;
    const baseDate = horaStr.includes('T') ? horaStr : `1970-01-01T${horaStr}:00.000Z`;
    return new Date(baseDate);
};

export class AppointmentsUseCases {
    constructor(private readonly repo: IAppointmentsRepository) {}

    async getAllAppointments(query: GetAppointmentsQueryDTO) {
        return this.repo.findPaginated(query);
    }

    async getAppointmentById(id: number) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de Cita inválido", 400);
        const cita = await this.repo.findById(id);
        if (!cita) throw new AppError("Cita no encontrada", 404);
        return cita;
    }

    async createAppointment(data: CreateAppointmentDTO) {
        if (!data.id_cliente && !data.nuevo_cliente) throw new AppError("Debe especificar un cliente existente o los datos para crear uno nuevo", 400);
        const fecha = new Date(data.fecha_cita);
        const hora = parseHoraCita(data.hora_cita);
        if (isNaN(fecha.getTime()) || isNaN(hora.getTime())) throw new AppError("Fecha u hora de cita inválida", 400);
        const conflictos = await this.repo.findConflictingAppointments(
            fecha, hora, data.id_lote, data.id_usuario_responsable
        );
        if (conflictos.length > 0) throw new AppError("Ya existe una cita en esa fecha y hora para este lote o este asesor", 409);
        return this.repo.create(data, fecha, hora);
    }

    async updateAppointment(id: number, data: UpdateAppointmentDTO) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de Cita inválido", 400);
        const existing = await this.repo.findById(id);
        if (!existing) throw new AppError("Cita no encontrada", 404);
        if (data.puntuacion_cliente !== undefined && data.puntuacion_cliente !== null) {
            if (data.puntuacion_cliente < 1 || data.puntuacion_cliente > 5) throw new AppError("La puntuación debe ser un valor entre 1 y 5 estrellas", 400);
        }

        let fecha = existing.fecha_cita;
        let hora = existing.hora_cita!;
        let recalarConflicto = false;

        if (data.fecha_cita) {
            fecha = new Date(data.fecha_cita);
            if (isNaN(fecha.getTime())) throw new AppError("Fecha inválida", 400);
            recalarConflicto = true;
        }

        if (data.hora_cita) {
            hora = parseHoraCita(data.hora_cita);
            if (isNaN(hora.getTime())) throw new AppError("Hora inválida", 400);
            recalarConflicto = true;
        }

        if (recalarConflicto || data.id_lote || data.id_usuario_responsable) {
            const checkLote = data.id_lote === null ? undefined : (data.id_lote ?? existing.id_lote);
            const checkAsesor = data.id_usuario_responsable ?? existing.id_usuario_responsable;
            const conflictos = await this.repo.findConflictingAppointments(
                fecha, hora, checkLote, checkAsesor, id
            );
            if (conflictos.length > 0) throw new AppError("La modificación genera un solapamiento con otra cita en la misma fecha y hora", 409);
        }

        return this.repo.update(id, data, data.fecha_cita ? fecha : undefined, data.hora_cita ? hora : undefined);
    }

    async deleteAppointment(id: number) {
        if (isNaN(id) || id <= 0) throw new AppError("ID de Cita inválido", 400);
        const existing = await this.repo.findById(id);
        if (!existing) throw new AppError("Cita no encontrada", 404);
        return this.repo.delete(id);
    }
}