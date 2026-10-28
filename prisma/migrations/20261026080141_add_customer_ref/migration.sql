/*
  Warnings:

  - A unique constraint covering the columns `[customerRef]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerRef_key" ON "Customer"("customerRef");
