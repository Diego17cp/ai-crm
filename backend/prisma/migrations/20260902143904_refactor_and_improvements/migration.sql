/*
  Warnings:

  - You are about to drop the column `id_cliente` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `apellidos` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `es_peruano` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `estado_civil` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nacimiento` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `id_tipo_doc_identidad` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `id_ubigeo` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `nacionalidad` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `ocupacion` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `sexo` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_persona` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `id_cliente` on the `conversaciones` table. All the data in the column will be lost.
  - You are about to drop the `notificacion_cuota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `telefonos_cliente` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_persona]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_persona` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_persona` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_persona` to the `conversaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_asesor` to the `ventas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoLead" AS ENUM ('NUEVO', 'CONTACTADO', 'CALIFICADO', 'INTERESADO', 'CITA_AGENDADA', 'NEGOCIACION', 'GANADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "EstadoCotizacion" AS ENUM ('BORRADOR', 'EMITIDA', 'ACEPTADA', 'RECHAZADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "TipoEvaluacion" AS ENUM ('CHATBOT', 'ASESOR', 'CITA');

-- CreateEnum
CREATE TYPE "TipoEventoConversacion" AS ENUM ('INICIADA', 'MENSAJE_RECIBIDO', 'MENSAGE_ENVIADO', 'BOT_RESPONDE', 'TRANSFERIDA_A_HUMANO', 'ASESOR_ASIGNADO', 'CITA_CREADA', 'COTIZACION_CREADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "GeneradoPor" AS ENUM ('BOT', 'ASESOR');

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_id_tipo_doc_identidad_fkey";

-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_id_ubigeo_fkey";

-- DropForeignKey
ALTER TABLE "conversaciones" DROP CONSTRAINT "conversaciones_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "notificacion_cuota" DROP CONSTRAINT "notificacion_cuota_id_cuota_fkey";

-- DropForeignKey
ALTER TABLE "notificacion_cuota" DROP CONSTRAINT "notificacion_cuota_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "telefonos_cliente" DROP CONSTRAINT "telefonos_cliente_id_cliente_fkey";

-- DropIndex
DROP INDEX "citas_id_cliente_idx";

-- DropIndex
DROP INDEX "clientes_id_tipo_doc_identidad_idx";

-- DropIndex
DROP INDEX "clientes_id_ubigeo_idx";

-- DropIndex
DROP INDEX "conversaciones_id_cliente_idx";

-- AlterTable
ALTER TABLE "citas" DROP COLUMN "id_cliente",
ADD COLUMN     "clientesId" INTEGER,
ADD COLUMN     "id_lead" INTEGER,
ADD COLUMN     "id_persona" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "apellidos",
DROP COLUMN "direccion",
DROP COLUMN "email",
DROP COLUMN "es_peruano",
DROP COLUMN "estado_civil",
DROP COLUMN "fecha_nacimiento",
DROP COLUMN "id_tipo_doc_identidad",
DROP COLUMN "id_ubigeo",
DROP COLUMN "nacionalidad",
DROP COLUMN "nombres",
DROP COLUMN "numero",
DROP COLUMN "ocupacion",
DROP COLUMN "sexo",
DROP COLUMN "tipo_persona",
ADD COLUMN     "id_persona" INTEGER NOT NULL,
ADD COLUMN     "tipoDocIdentidadId" INTEGER,
ADD COLUMN     "ubigeosId" CHAR(6);

-- AlterTable
ALTER TABLE "conversaciones" DROP COLUMN "id_cliente",
ADD COLUMN     "clientesId" INTEGER,
ADD COLUMN     "fecha_finalizacion" TIMESTAMP(3),
ADD COLUMN     "fecha_primer_mensaje" TIMESTAMP(3),
ADD COLUMN     "fecha_primera_respuesta_bot" TIMESTAMP(3),
ADD COLUMN     "fecha_primera_respuesta_humana" TIMESTAMP(3),
ADD COLUMN     "fecha_transferencia" TIMESTAMP(3),
ADD COLUMN     "id_lead" INTEGER,
ADD COLUMN     "id_persona" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "lotes" ADD COLUMN     "ubicacion_referencial" TEXT;

-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "plano_url" VARCHAR(255),
ADD COLUMN     "porcentaje_descuento" DECIMAL(5,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "ventas" ADD COLUMN     "id_asesor" UUID NOT NULL,
ADD COLUMN     "id_cotizacion" INTEGER,
ADD COLUMN     "id_lead" INTEGER;

-- DropTable
DROP TABLE "notificacion_cuota";

-- DropTable
DROP TABLE "telefonos_cliente";

-- DropEnum
DROP TYPE "TipoPersona";

-- CreateTable
CREATE TABLE "personas" (
    "id" SERIAL NOT NULL,
    "id_tipo_doc" INTEGER NOT NULL,
    "id_ubigeo" CHAR(6),
    "numero" VARCHAR(12) NOT NULL,
    "nombres" VARCHAR(50),
    "apellidos" VARCHAR(50),
    "fecha_nacimiento" DATE,
    "sexo" "SexoPersona",
    "estado_civil" "EstadoCivil",
    "es_peruano" BOOLEAN NOT NULL DEFAULT true,
    "nacionalidad" VARCHAR(30),
    "direccion" VARCHAR(255),
    "email" VARCHAR(100),
    "ocupacion" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "id_asesor" UUID,
    "id_proyecto" INTEGER,
    "estado" "EstadoLead" NOT NULL DEFAULT 'NUEVO',
    "origen" VARCHAR(50),
    "motivo_perdida" VARCHAR(255),
    "fecha_contact" TIMESTAMP(3),
    "fecha_calificacion" TIMESTAMP(3),
    "fecha_cierre" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefonos_persona" (
    "id" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "numero" VARCHAR(20),
    "tipo" "TipoTelefono",

    CONSTRAINT "telefonos_persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversacion_asignacion" (
    "id" SERIAL NOT NULL,
    "id_conversacion" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "motivo" VARCHAR(100),

    CONSTRAINT "conversacion_asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_conversacion" (
    "id" SERIAL NOT NULL,
    "id_conversacion" UUID NOT NULL,
    "tipo" "TipoEventoConversacion" NOT NULL,
    "id_usuario" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_conversacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones_cuota" (
    "id" SERIAL NOT NULL,
    "id_cuota" INTEGER NOT NULL,
    "id_usuario" UUID,
    "template" VARCHAR(100) NOT NULL,
    "telefono_destino" VARCHAR(20) NOT NULL,
    "nivel_urgencia" VARCHAR(20),
    "es_automatica" BOOLEAN NOT NULL DEFAULT true,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "id_lead" INTEGER,
    "id_lote" INTEGER NOT NULL,
    "generado_por" "GeneradoPor" NOT NULL DEFAULT 'BOT',
    "id_asesor" UUID,
    "requiere_revision" BOOLEAN NOT NULL DEFAULT false,
    "id_revisor" UUID,
    "fecha_revision" TIMESTAMP(3),
    "area_m2" DECIMAL(12,2) NOT NULL,
    "precio_m2" DECIMAL(12,2) NOT NULL,
    "precio_lista" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "precio_final" DECIMAL(12,2) NOT NULL,
    "cuota_inicial" DECIMAL(12,2),
    "numero_cuotas" INTEGER,
    "monto_cuota" DECIMAL(12,2),
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'BORRADOR',
    "pdf_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "clientesId" INTEGER,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_atencion" (
    "id" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "id_conversacion" UUID,
    "id_usuario" UUID,
    "tipo" "TipoEvaluacion" NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "criterios" JSONB,
    "sentimiento" VARCHAR(100),
    "es_automatica" BOOLEAN NOT NULL DEFAULT true,
    "id_mensage_desde" INTEGER,
    "id_mensage_hacia" INTEGER,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientesId" INTEGER,

    CONSTRAINT "evaluaciones_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metricas_asesor_diarias" (
    "id" SERIAL NOT NULL,
    "id_usuario" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "clientes_atendidos" INTEGER NOT NULL DEFAULT 0,
    "tiempo_respuesta_prom_seg" INTEGER,
    "puntuacion_atencion_prom" DECIMAL(3,2),
    "ventas_cerradas" INTEGER NOT NULL DEFAULT 0,
    "monto_vendido" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tasa_cierre_propio" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metricas_asesor_diarias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personas_id_ubigeo_idx" ON "personas"("id_ubigeo");

-- CreateIndex
CREATE UNIQUE INDEX "personas_id_tipo_doc_numero_key" ON "personas"("id_tipo_doc", "numero");

-- CreateIndex
CREATE INDEX "leads_id_persona_idx" ON "leads"("id_persona");

-- CreateIndex
CREATE INDEX "leads_id_asesor_idx" ON "leads"("id_asesor");

-- CreateIndex
CREATE INDEX "leads_id_proyecto_idx" ON "leads"("id_proyecto");

-- CreateIndex
CREATE INDEX "leads_estado_idx" ON "leads"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "telefonos_persona_numero_key" ON "telefonos_persona"("numero");

-- CreateIndex
CREATE INDEX "telefonos_persona_id_persona_idx" ON "telefonos_persona"("id_persona");

-- CreateIndex
CREATE INDEX "conversacion_asignacion_id_conversacion_idx" ON "conversacion_asignacion"("id_conversacion");

-- CreateIndex
CREATE INDEX "conversacion_asignacion_id_usuario_idx" ON "conversacion_asignacion"("id_usuario");

-- CreateIndex
CREATE INDEX "eventos_conversacion_id_conversacion_idx" ON "eventos_conversacion"("id_conversacion");

-- CreateIndex
CREATE INDEX "eventos_conversacion_tipo_idx" ON "eventos_conversacion"("tipo");

-- CreateIndex
CREATE INDEX "eventos_conversacion_created_at_idx" ON "eventos_conversacion"("created_at");

-- CreateIndex
CREATE INDEX "notificaciones_cuota_id_cuota_idx" ON "notificaciones_cuota"("id_cuota");

-- CreateIndex
CREATE INDEX "notificaciones_cuota_id_usuario_idx" ON "notificaciones_cuota"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_codigo_key" ON "cotizaciones"("codigo");

-- CreateIndex
CREATE INDEX "cotizaciones_id_persona_idx" ON "cotizaciones"("id_persona");

-- CreateIndex
CREATE INDEX "cotizaciones_id_lead_idx" ON "cotizaciones"("id_lead");

-- CreateIndex
CREATE INDEX "cotizaciones_id_lote_idx" ON "cotizaciones"("id_lote");

-- CreateIndex
CREATE INDEX "cotizaciones_id_asesor_idx" ON "cotizaciones"("id_asesor");

-- CreateIndex
CREATE INDEX "evaluaciones_atencion_id_persona_idx" ON "evaluaciones_atencion"("id_persona");

-- CreateIndex
CREATE INDEX "evaluaciones_atencion_id_conversacion_idx" ON "evaluaciones_atencion"("id_conversacion");

-- CreateIndex
CREATE INDEX "evaluaciones_atencion_id_usuario_idx" ON "evaluaciones_atencion"("id_usuario");

-- CreateIndex
CREATE INDEX "metricas_asesor_diarias_fecha_idx" ON "metricas_asesor_diarias"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "metricas_asesor_diarias_id_usuario_fecha_key" ON "metricas_asesor_diarias"("id_usuario", "fecha");

-- CreateIndex
CREATE INDEX "citas_id_persona_idx" ON "citas"("id_persona");

-- CreateIndex
CREATE INDEX "citas_id_lead_idx" ON "citas"("id_lead");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_id_persona_key" ON "clientes"("id_persona");

-- CreateIndex
CREATE INDEX "conversaciones_id_persona_idx" ON "conversaciones"("id_persona");

-- CreateIndex
CREATE INDEX "conversaciones_id_lead_idx" ON "conversaciones"("id_lead");

-- CreateIndex
CREATE INDEX "conversaciones_id_usuario_asignado_idx" ON "conversaciones"("id_usuario_asignado");

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_id_tipo_doc_fkey" FOREIGN KEY ("id_tipo_doc") REFERENCES "tipo_doc_identidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_id_ubigeo_fkey" FOREIGN KEY ("id_ubigeo") REFERENCES "ubigeos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_ubigeosId_fkey" FOREIGN KEY ("ubigeosId") REFERENCES "ubigeos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipoDocIdentidadId_fkey" FOREIGN KEY ("tipoDocIdentidadId") REFERENCES "tipo_doc_identidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefonos_persona" ADD CONSTRAINT "telefonos_persona_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_clientesId_fkey" FOREIGN KEY ("clientesId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversacion_asignacion" ADD CONSTRAINT "conversacion_asignacion_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversacion_asignacion" ADD CONSTRAINT "conversacion_asignacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_conversacion" ADD CONSTRAINT "eventos_conversacion_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_conversacion" ADD CONSTRAINT "eventos_conversacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_clientesId_fkey" FOREIGN KEY ("clientesId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones_cuota" ADD CONSTRAINT "notificaciones_cuota_id_cuota_fkey" FOREIGN KEY ("id_cuota") REFERENCES "cuotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones_cuota" ADD CONSTRAINT "notificaciones_cuota_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_revisor_fkey" FOREIGN KEY ("id_revisor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_clientesId_fkey" FOREIGN KEY ("clientesId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_atencion" ADD CONSTRAINT "evaluaciones_atencion_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_atencion" ADD CONSTRAINT "evaluaciones_atencion_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_atencion" ADD CONSTRAINT "evaluaciones_atencion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_atencion" ADD CONSTRAINT "evaluaciones_atencion_clientesId_fkey" FOREIGN KEY ("clientesId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metricas_asesor_diarias" ADD CONSTRAINT "metricas_asesor_diarias_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
