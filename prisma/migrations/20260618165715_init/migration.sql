-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'SALESMAN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING');

-- CreateEnum
CREATE TYPE "StockTxnType" AS ENUM ('OPENING', 'PURCHASE', 'SALE', 'DAMAGE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('OPENING', 'PO', 'BILL', 'DAMAGE', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "contactNumber" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "location" TEXT,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNo" TEXT,
    "gstin" TEXT,
    "contactPerson" TEXT,
    "address" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemMaster" (
    "id" SERIAL NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemDesc" TEXT NOT NULL,
    "hsnCode" TEXT,
    "category" TEXT,
    "brand" TEXT,
    "packSize" INTEGER NOT NULL,
    "unitName" TEXT NOT NULL,
    "gstPct" DECIMAL(5,2) NOT NULL,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemStock" (
    "itemId" INTEGER NOT NULL,
    "currentStockPieces" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemStock_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "PoHdr" (
    "id" SERIAL NOT NULL,
    "poDate" TIMESTAMP(3) NOT NULL,
    "invoiceNumber" TEXT,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "discountAmount" DECIMAL(18,2) NOT NULL,
    "cgstAmount" DECIMAL(18,2) NOT NULL,
    "sgstAmount" DECIMAL(18,2) NOT NULL,
    "netAmount" DECIMAL(18,2) NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoHdr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoDtl" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "packQty" INTEGER NOT NULL,
    "looseQty" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "purchaseRate" DECIMAL(18,2) NOT NULL,
    "lineAmount" DECIMAL(18,2) NOT NULL,
    "discountPct" DECIMAL(5,2) NOT NULL,
    "discountAmount" DECIMAL(18,2) NOT NULL,
    "cgstPct" DECIMAL(5,2) NOT NULL,
    "sgstPct" DECIMAL(5,2) NOT NULL,
    "netAmount" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "PoDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillHdr" (
    "id" SERIAL NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "discountAmount" DECIMAL(18,2) NOT NULL,
    "cgstAmount" DECIMAL(18,2) NOT NULL,
    "sgstAmount" DECIMAL(18,2) NOT NULL,
    "netAmount" DECIMAL(18,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillHdr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillDtl" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "packQty" INTEGER NOT NULL,
    "looseQty" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "saleRate" DECIMAL(18,2) NOT NULL,
    "lineAmount" DECIMAL(18,2) NOT NULL,
    "discountPct" DECIMAL(5,2) NOT NULL,
    "discountAmount" DECIMAL(18,2) NOT NULL,
    "cgstPct" DECIMAL(5,2) NOT NULL,
    "sgstPct" DECIMAL(5,2) NOT NULL,
    "netAmount" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "BillDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Damage" (
    "id" SERIAL NOT NULL,
    "damageDate" TIMESTAMP(3) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "packQty" INTEGER NOT NULL,
    "looseQty" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "reason" TEXT,
    "estimatedLoss" DECIMAL(18,2),
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Damage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" SERIAL NOT NULL,
    "txnDate" TIMESTAMP(3) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "txnType" "StockTxnType" NOT NULL,
    "referenceType" "ReferenceType" NOT NULL,
    "referenceId" INTEGER,
    "qtyInPieces" INTEGER NOT NULL DEFAULT 0,
    "qtyOutPieces" INTEGER NOT NULL DEFAULT 0,
    "balanceAfter" INTEGER NOT NULL,
    "unitCost" DECIMAL(18,2),
    "unitPrice" DECIMAL(18,2),
    "remarks" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemMaster_itemCode_key" ON "ItemMaster"("itemCode");

-- AddForeignKey
ALTER TABLE "ItemStock" ADD CONSTRAINT "ItemStock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoHdr" ADD CONSTRAINT "PoHdr_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoHdr" ADD CONSTRAINT "PoHdr_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoDtl" ADD CONSTRAINT "PoDtl_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PoHdr"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoDtl" ADD CONSTRAINT "PoDtl_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillHdr" ADD CONSTRAINT "BillHdr_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillHdr" ADD CONSTRAINT "BillHdr_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillDtl" ADD CONSTRAINT "BillDtl_billId_fkey" FOREIGN KEY ("billId") REFERENCES "BillHdr"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillDtl" ADD CONSTRAINT "BillDtl_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Damage" ADD CONSTRAINT "Damage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Damage" ADD CONSTRAINT "Damage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
