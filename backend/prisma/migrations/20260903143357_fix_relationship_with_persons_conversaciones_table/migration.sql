-- DropForeignKey
ALTER TABLE "conversaciones" DROP CONSTRAINT "conversaciones_id_persona_fkey";

-- AlterTable
ALTER TABLE "conversaciones" ALTER COLUMN "id_persona" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
