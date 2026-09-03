-- DropForeignKey
ALTER TABLE "personas" DROP CONSTRAINT "personas_id_tipo_doc_fkey";

-- AlterTable
ALTER TABLE "personas" ALTER COLUMN "id_tipo_doc" DROP NOT NULL,
ALTER COLUMN "numero" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_id_tipo_doc_fkey" FOREIGN KEY ("id_tipo_doc") REFERENCES "tipo_doc_identidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
