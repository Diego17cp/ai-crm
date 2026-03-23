import { Request, Response, NextFunction } from "express";
import { AppointmentsUseCases } from "../../application/use-cases/AppointmentsUseCases";
import { CreateAppointmentDTO, GetAppointmentsQueryDTO, UpdateAppointmentDTO } from "../../domain/dtos";
import { EstadoCita } from "generated/prisma/client";

const formatCitaResponse = (cita: any) => {
    if (!cita) return cita;
    const formatted = { ...cita };
    if (formatted.hora_cita && formatted.hora_cita instanceof Date) {
        const hours = formatted.hora_cita.getUTCHours().toString().padStart(2, '0');
        const minutes = formatted.hora_cita.getUTCMinutes().toString().padStart(2, '0');
        formatted.hora_cita = `${hours}:${minutes}`;
    }
    return formatted;
};

export class AppointmentsController {
    constructor(private readonly useCases: AppointmentsUseCases) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query: GetAppointmentsQueryDTO = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                estado_cita: req.query.estado_cita as EstadoCita,
                fecha_inicio: req.query.fecha_inicio as string,
                fecha_fin: req.query.fecha_fin as string,
                puntuacion: req.query.puntuacion ? parseInt(req.query.puntuacion as string) : undefined,
                id_proyecto: req.query.id_proyecto ? parseInt(req.query.id_proyecto as string) : undefined,
                id_usuario_responsable: req.query.id_usuario_responsable as string,
            };

            const result = await this.useCases.getAllAppointments(query);
            const formattedData = result.data.map(formatCitaResponse);
            res.status(200).json({ ...result, data: formattedData });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const cita = await this.useCases.getAppointmentById(id);
            const formattedCita = formatCitaResponse(cita);
            res.status(200).json(formattedCita);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: CreateAppointmentDTO = req.body;
            const newAppointment = await this.useCases.createAppointment(data);
            res.status(201).json({
                success: true,
                message: "Cita programada correctamente",
                data: formatCitaResponse(newAppointment),
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data: UpdateAppointmentDTO = req.body;

            const updatedAppointment = await this.useCases.updateAppointment(id, data);
            res.status(200).json({
                success: true,
                message: "Cita actualizada correctamente",
                data: formatCitaResponse(updatedAppointment),
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            await this.useCases.deleteAppointment(id);
            res.status(200).json({
                success: true,
                message: "Cita eliminada correctamente",
            });
        } catch (error) {
            next(error);
        }
    };
}