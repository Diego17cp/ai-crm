/*
  Warnings:

  - You are about to drop the column `fecha_contact` on the `leads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "leads" DROP COLUMN "fecha_contact",
ADD COLUMN     "fecha_contacto" TIMESTAMP(3);
