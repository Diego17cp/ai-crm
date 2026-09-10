-- AlterTable
ALTER TABLE "metricas_asesor_diarias" ADD COLUMN     "evaluaciones_contadas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "respuestas_contadas" INTEGER NOT NULL DEFAULT 0;
