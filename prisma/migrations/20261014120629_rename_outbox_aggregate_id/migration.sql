/*
  Warnings:

  - You are about to drop the column `agregateId` on the `OutboxEvents` table. All the data in the column will be lost.
  - Added the required column `aggregateId` to the `OutboxEvents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OutboxEvents" DROP CONSTRAINT "OutboxEvents_agregateId_fkey";

-- AlterTable
ALTER TABLE "OutboxEvents" DROP COLUMN "agregateId",
ADD COLUMN     "aggregateId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OutboxEvents" ADD CONSTRAINT "OutboxEvents_aggregateId_fkey" FOREIGN KEY ("aggregateId") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
