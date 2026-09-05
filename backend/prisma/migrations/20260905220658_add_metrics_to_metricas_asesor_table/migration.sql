-- AlterTable
ALTER TABLE "metricas_asesor_diarias" ADD COLUMN     "citas_agendadas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "citas_atendidas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cotizaciones_generadas" INTEGER NOT NULL DEFAULT 0;
