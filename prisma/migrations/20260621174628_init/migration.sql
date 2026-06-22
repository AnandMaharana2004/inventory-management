-- CreateEnum
CREATE TYPE "DiscountAttribute" AS ENUM ('PER_ITEM', 'PER_PACK', 'PER_AMOUNT');

-- CreateTable
CREATE TABLE "Discount" (
    "id" SERIAL NOT NULL,
    "onItemId" INTEGER NOT NULL,
    "discountedItemId" INTEGER NOT NULL,
    "perAttribute" "DiscountAttribute" NOT NULL,
    "attributeQty" DECIMAL(18,2) NOT NULL,
    "discountedAttribute" "DiscountAttribute" NOT NULL,
    "discountedQty" DECIMAL(18,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_onItemId_fkey" FOREIGN KEY ("onItemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_discountedItemId_fkey" FOREIGN KEY ("discountedItemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
