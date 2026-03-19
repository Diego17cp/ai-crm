/*
  Warnings:

  - A unique constraint covering the columns `[session_id]` on the table `conversaciones` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "conversaciones" DROP CONSTRAINT "conversaciones_id_cliente_fkey";

-- AlterTable
ALTER TABLE "conversaciones" ADD COLUMN     "session_id" VARCHAR(100),
ALTER COLUMN "id_cliente" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "conversaciones_session_id_key" ON "conversaciones"("session_id");

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
