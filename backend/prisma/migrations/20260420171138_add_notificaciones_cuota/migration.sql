-- CreateTable
CREATE TABLE "notificacion_cuota" (
    "id" SERIAL NOT NULL,
    "id_cuota" INTEGER NOT NULL,
    "id_usuario" UUID,
    "template" VARCHAR(100) NOT NULL,
    "telefono_destino" VARCHAR(20) NOT NULL,
    "nivel_urgencia" VARCHAR(20),
    "es_automatica" BOOLEAN NOT NULL DEFAULT true,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_cuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificacion_cuota_id_cuota_idx" ON "notificacion_cuota"("id_cuota");

-- CreateIndex
CREATE INDEX "notificacion_cuota_id_usuario_idx" ON "notificacion_cuota"("id_usuario");

-- AddForeignKey
ALTER TABLE "notificacion_cuota" ADD CONSTRAINT "notificacion_cuota_id_cuota_fkey" FOREIGN KEY ("id_cuota") REFERENCES "cuotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion_cuota" ADD CONSTRAINT "notificacion_cuota_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
