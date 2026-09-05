-- AlterTable
ALTER TABLE "cotizaciones" ADD COLUMN     "id_conversacion" UUID,
ADD COLUMN     "motivo_rechazo" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
