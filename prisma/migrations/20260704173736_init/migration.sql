/*
  Warnings:

  - A unique constraint covering the columns `[gstin]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RateBasis" AS ENUM ('PIECE_EXCL_GST', 'PIECE_INCL_GST', 'PACK_EXCL_GST', 'PACK_INCL_GST');

-- AlterTable
ALTER TABLE "PoDtl" ADD COLUMN     "rateBasis" "RateBasis" NOT NULL DEFAULT 'PIECE_EXCL_GST';

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_gstin_key" ON "Vendor"("gstin");
