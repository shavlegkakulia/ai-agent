-- CreateEnum
CREATE TYPE "DocumentScope" AS ENUM ('USER', 'COMPANY');

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "scope" "DocumentScope" NOT NULL DEFAULT 'COMPANY';
