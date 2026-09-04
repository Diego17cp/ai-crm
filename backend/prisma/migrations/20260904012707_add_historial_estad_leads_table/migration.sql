-- CreateTable
CREATE TABLE "historial_estado_lead" (
    "id" SERIAL NOT NULL,
    "id_lead" INTEGER NOT NULL,
    "estado_anterior" "EstadoLead",
    "estado_nuevo" "EstadoLead" NOT NULL,
    "id_usuario" UUID,
    "motivo" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_estado_lead_id_lead_idx" ON "historial_estado_lead"("id_lead");

-- AddForeignKey
ALTER TABLE "historial_estado_lead" ADD CONSTRAINT "historial_estado_lead_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_lead" ADD CONSTRAINT "historial_estado_lead_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
