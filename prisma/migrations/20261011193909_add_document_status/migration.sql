-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING';
