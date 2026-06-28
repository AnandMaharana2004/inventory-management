import prisma from "@/lib/prisma";
import { ReferenceType, StockTxnType } from "@/lib/generated/prisma/client";
import { DiscountAttribute, PaymentStatus } from "@/lib/generated/prisma/enums";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/response";
import { saleRepository } from "@/repositories/sale.repository";
import { stockRepository } from "@/repositories/stock.repository";
import { ledgerRepository } from "@/repositories/ledger.repository";
import { itemRepository } from "@/repositories/item.repository";
import { customerRepository } from "@/repositories/customer.repository";
import { discountRepository } from "@/repositories/discount.repository";
import type { CreateSaleInput } from "@/validation/sale.validation";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Converts a raw quantity into whatever unit a discount rule is expressed in
const toAttributeQty = (
    attribute: DiscountAttribute,
    totalPieces: number,
    lineAmount: number,
    packSize: number
): number => {
    switch (attribute) {
        case DiscountAttribute.PER_ITEM:
            return totalPieces;
        case DiscountAttribute.PER_PACK:
            return Math.floor(totalPieces / packSize);
        case DiscountAttribute.PER_AMOUNT:
            return lineAmount;
    }
};

const CreateSale = async (body: CreateSaleInput, createdById: number) => {
    const { billDate, customerId, paymentStatus, details } = body;

    const customer = await customerRepository.getCustomerById(customerId);
    if (!customer) {
        throw new BadRequestError("Customer does not exist.");
    }

    // Fetch + validate every item, compute pre-discount line figures
    const baseLines = await Promise.all(
        details.map(async (line) => {
            const item = await itemRepository.getItemById(line.itemId);
            if (!item) {
                throw new BadRequestError(`Item with id ${line.itemId} does not exist.`);
            }
            if (!item.isActive) {
                throw new BadRequestError(`Item "${item.itemDesc}" is inactive and cannot be sold.`);
            }

            const totalPieces = line.packQty * item.packSize + line.looseQty;
            const lineAmount = round2(totalPieces * line.saleRate);

            return {
                itemId: line.itemId,
                packQty: line.packQty,
                looseQty: line.looseQty,
                totalPieces,
                saleRate: line.saleRate,
                lineAmount,
                packSize: item.packSize,
                gstPct: item.gstPct.toNumber(),
            };
        })
    );

    // Aggregate demand per item — the same item can appear on more than one line
    const demandByItem = new Map<number, number>();
    const amountByItem = new Map<number, number>();
    const packSizeByItem = new Map<number, number>();
    for (const line of baseLines) {
        demandByItem.set(line.itemId, (demandByItem.get(line.itemId) ?? 0) + line.totalPieces);
        amountByItem.set(line.itemId, (amountByItem.get(line.itemId) ?? 0) + line.lineAmount);
        packSizeByItem.set(line.itemId, line.packSize);
    }

    // --- Stock sufficiency pre-check (fast-fail before opening a transaction) ---
    for (const [itemId, demand] of demandByItem.entries()) {
        const stock = await stockRepository.getStockByItemId(itemId);
        const available = stock?.currentStockPieces ?? 0;
        if (available < demand) {
            throw new ConflictError(
                `Insufficient stock for item id ${itemId}. Available: ${available}, Required: ${demand}.`
            );
        }
    }

    // --- Discount lookup ---
    // Only discounts active + within date range as of the bill date, and only ones
    // touching an item actually on this bill (on either side of the offer).
    const itemIdsOnBill = new Set(demandByItem.keys());
    const currentDiscounts = await discountRepository.getCurrentDiscounts(billDate);
    const relevantDiscounts = currentDiscounts.filter(
        (d) => itemIdsOnBill.has(d.onItemId) || itemIdsOnBill.has(d.discountedItemId)
    );

    const computedLines = baseLines.map((line) => {
        let discountAmount = 0;

        // Discounts where THIS line is the one receiving the discount
        const applicable = relevantDiscounts.filter((d) => d.discountedItemId === line.itemId);

        for (const discount of applicable) {
            const onItemPieces = demandByItem.get(discount.onItemId) ?? 0;
            const onItemAmount = amountByItem.get(discount.onItemId) ?? 0;
            const onItemPackSize = packSizeByItem.get(discount.onItemId) ?? line.packSize;

            const onItemQty = toAttributeQty(
                discount.perAttribute,
                onItemPieces,
                onItemAmount,
                onItemPackSize
            );

            const attributeQty = discount.attributeQty.toNumber();
            const multiplier = Math.floor(onItemQty / attributeQty);

            if (multiplier < 1) continue; // trigger threshold not reached

            const discountedQty = discount.discountedQty.toNumber() * multiplier;

            let amount = 0;
            switch (discount.discountedAttribute) {
                case DiscountAttribute.PER_ITEM:
                    amount = Math.min(discountedQty, line.totalPieces) * line.saleRate;
                    break;
                case DiscountAttribute.PER_PACK:
                    amount = Math.min(discountedQty * line.packSize, line.totalPieces) * line.saleRate;
                    break;
                case DiscountAttribute.PER_AMOUNT:
                    amount = discountedQty;
                    break;
            }

            discountAmount += amount;
        }

        // Stacked discounts can never exceed the line's own value
        discountAmount = round2(Math.min(discountAmount, line.lineAmount));
        const discountPct = line.lineAmount > 0 ? round2((discountAmount / line.lineAmount) * 100) : 0;

        const taxableAmount = round2(line.lineAmount - discountAmount);
        const cgstPct = round2(line.gstPct / 2);
        const sgstPct = round2(line.gstPct / 2);
        const cgstAmount = round2((taxableAmount * cgstPct) / 100);
        const sgstAmount = round2((taxableAmount * sgstPct) / 100);
        const netAmount = round2(taxableAmount + cgstAmount + sgstAmount);

        return {
            itemId: line.itemId,
            packQty: line.packQty,
            looseQty: line.looseQty,
            totalPieces: line.totalPieces,
            saleRate: line.saleRate,
            lineAmount: line.lineAmount,
            discountPct,
            discountAmount,
            cgstPct,
            sgstPct,
            cgstAmount,
            sgstAmount,
            netAmount,
        };
    });

    const totalAmount = round2(computedLines.reduce((sum, l) => sum + l.lineAmount, 0));
    const discountAmountTotal = round2(computedLines.reduce((sum, l) => sum + l.discountAmount, 0));
    const cgstAmount = round2(computedLines.reduce((sum, l) => sum + l.cgstAmount, 0));
    const sgstAmount = round2(computedLines.reduce((sum, l) => sum + l.sgstAmount, 0));
    const netAmount = round2(computedLines.reduce((sum, l) => sum + l.netAmount, 0));

    return prisma.$transaction(async (tx) => {
        // Re-check stock inside the transaction — narrows (does not fully close)
        // the race window between the pre-check above and this write.
        for (const [itemId, demand] of demandByItem.entries()) {
            const stock = await tx.itemStock.findUnique({ where: { itemId } });
            const available = stock?.currentStockPieces ?? 0;
            if (available < demand) {
                throw new ConflictError(
                    `Insufficient stock for item id ${itemId}. Available: ${available}, Required: ${demand}.`
                );
            }
        }

        const bill = await saleRepository.create(tx, {
            billDate,
            totalAmount,
            discountAmount: discountAmountTotal,
            cgstAmount,
            sgstAmount,
            netAmount,
            paymentStatus,
            customer: { connect: { id: customerId } },
            createdBy: { connect: { id: createdById } },
            details: {
                create: computedLines.map((line) => ({
                    item: { connect: { id: line.itemId } },
                    packQty: line.packQty,
                    looseQty: line.looseQty,
                    totalPieces: line.totalPieces,
                    saleRate: line.saleRate,
                    lineAmount: line.lineAmount,
                    discountPct: line.discountPct,
                    discountAmount: line.discountAmount,
                    cgstPct: line.cgstPct,
                    sgstPct: line.sgstPct,
                    netAmount: line.netAmount,
                })),
            },
        });

        const ledgerEntries = [];
        for (const line of computedLines) {
            const updatedStock = await stockRepository.decreaseStock(tx, line.itemId, line.totalPieces);

            ledgerEntries.push({
                txnDate: billDate,
                item: { connect: { id: line.itemId } },
                txnType: StockTxnType.SALE,
                referenceType: ReferenceType.BILL,
                referenceId: bill.id,
                qtyInPieces: 0,
                qtyOutPieces: line.totalPieces,
                balanceAfter: updatedStock.currentStockPieces,
                unitPrice: line.saleRate,
                createdBy: { connect: { id: createdById } },
            });
        }

        await ledgerRepository.createMany(tx, ledgerEntries);

        return bill;
    });
};

const ListSales = async (
    customerId?: number,
    paymentStatus?: PaymentStatus,
    startDate?: Date,
    endDate?: Date
) => {
    if (customerId) return saleRepository.getSalesByCustomer(customerId);
    if (paymentStatus) return saleRepository.getSalesByPaymentStatus(paymentStatus);
    if (startDate && endDate) return saleRepository.getSalesByDateRange(startDate, endDate);
    return saleRepository.getAllSales();
};

const GetSaleById = async (id: number) => {
    const sale = await saleRepository.getSaleById(id);
    if (!sale) throw new NotFoundError("Sale bill not found.");
    return sale;
};

const UpdatePaymentStatus = async (id: number, paymentStatus: PaymentStatus) => {
    const sale = await saleRepository.getSaleById(id);
    if (!sale) throw new NotFoundError("Sale bill not found.");
    return saleRepository.updatePaymentStatus(id, paymentStatus);
};

export const saleService = {
    CreateSale,
    ListSales,
    GetSaleById,
    UpdatePaymentStatus,
};