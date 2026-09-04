/*
  Warnings:

  - The values [MENSAGE_ENVIADO] on the enum `TipoEventoConversacion` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoEventoConversacion_new" AS ENUM ('INICIADA', 'MENSAJE_RECIBIDO', 'MENSAJE_ENVIADO', 'BOT_RESPONDE', 'TRANSFERIDA_A_HUMANO', 'ASESOR_ASIGNADO', 'CITA_CREADA', 'COTIZACION_CREADA', 'FINALIZADA');
ALTER TABLE "eventos_conversacion" ALTER COLUMN "tipo" TYPE "TipoEventoConversacion_new" USING ("tipo"::text::"TipoEventoConversacion_new");
ALTER TYPE "TipoEventoConversacion" RENAME TO "TipoEventoConversacion_old";
ALTER TYPE "TipoEventoConversacion_new" RENAME TO "TipoEventoConversacion";
DROP TYPE "public"."TipoEventoConversacion_old";
COMMIT;
