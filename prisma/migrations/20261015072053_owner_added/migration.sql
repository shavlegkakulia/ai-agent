/*
  Warnings:

  - Added the required column `owner` to the `OutboxEvents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OutboxEvents" ADD COLUMN     "ownedAt" TIMESTAMP(3),
ADD COLUMN     "owner" TEXT NOT NULL;
