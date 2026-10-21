/*
  Warnings:

  - You are about to drop the column `scope` on the `Documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "scope";

-- DropEnum
DROP TYPE "DocumentScope";
