import { Citas } from "generated/prisma/client";
import { CreateAppointmentDTO, GetAppointmentsQueryDTO, PaginatedAppointmentsResult, UpdateAppointmentDTO } from "../../domain/dtos";

export interface IAppointmentsRepository {
    findPaginated(query: GetAppointmentsQueryDTO): Promise<PaginatedAppointmentsResult<Citas>>;
    findById(id: number): Promise<Citas | null>;
    create(data: CreateAppointmentDTO, parsedFecha: Date, parsedHora: Date): Promise<Citas>;
    update(id: number, data: UpdateAppointmentDTO, parsedFecha?: Date, parsedHora?: Date): Promise<Citas>;
    delete(id: number): Promise<Citas>;
    findConflictingAppointments(
        fecha_cita: Date, 
        hora_cita: Date, 
        id_lote?: number | null, 
        id_usuario_responsable?: string,
        excludeCitaId?: number
    ): Promise<Citas[]>;
}