import prisma from "@/lib/prisma";
import { ReferenceType, StockTxnType } from "@/lib/generated/prisma/client";
import { BadRequestError, NotFoundError } from "@/lib/response";
import { purchaseRepository } from "@/repositories/purchase.repository";
import { stockRepository } from "@/repositories/stock.repository";
import { ledgerRepository } from "@/repositories/ledger.repository";
import { itemRepository } from "@/repositories/item.repository";
import { vendorRepository } from "@/repositories/vendor.repository";
import type { CreatePurchaseInput } from "@/validation/purchase.validation";

// Money math via floating point is fine for now, but rounding errors can compound
// over many lines — flagged at the end, worth revisiting with Decimal.js arithmetic later.
const round2 = (n: number) => Math.round(n * 100) / 100;

const CreatePurchase = async (body: CreatePurchaseInput, createdById: number) => {
    const { poDate, invoiceNumber, vendorId, details } = body;

    // Confirm vendor exists
    const vendor = await vendorRepository.getVendorById(vendorId);
    if (!vendor) {
        throw new BadRequestError("Vendor does not exist.");
    }

    // Confirm every item exists + is active, and compute line-level amounts.
    // All done BEFORE the transaction starts — no point holding a DB transaction
    // open while we're still validating input.
    const computedLines = await Promise.all(
        details.map(async (line) => {
            const item = await itemRepository.getItemById(line.itemId);
            if (!item) {
                throw new BadRequestError(`Item with id ${line.itemId} does not exist.`);
            }
            if (!item.isActive) {
                throw new BadRequestError(
                    `Item "${item.itemDesc}" is inactive and cannot be purchased.`
                );
            }

            const totalPieces = line.packQty * item.packSize + line.looseQty;

            const lineAmount = round2(totalPieces * line.purchaseRate);
            const discountAmount = round2((lineAmount * line.discountPct) / 100);
            const taxableAmount = round2(lineAmount - discountAmount);

            const gstPct = item.gstPct.toNumber();
            const cgstPct = round2(gstPct / 2);
            const sgstPct = round2(gstPct / 2);
            const cgstAmount = round2((taxableAmount * cgstPct) / 100);
            const sgstAmount = round2((taxableAmount * sgstPct) / 100);
            const netAmount = round2(taxableAmount + cgstAmount + sgstAmount);

            return {
                itemId: line.itemId,
                packQty: line.packQty,
                looseQty: line.looseQty,
                totalPieces,
                purchaseRate: line.purchaseRate,
                lineAmount,
                discountPct: line.discountPct,
                discountAmount,
                cgstPct,
                sgstPct,
                cgstAmount,
                sgstAmount,
                netAmount,
            };
        })
    );

    // Header totals are just the sum of every line
    const totalAmount = round2(computedLines.reduce((sum, l) => sum + l.lineAmount, 0));
    const discountAmount = round2(computedLines.reduce((sum, l) => sum + l.discountAmount, 0));
    const cgstAmount = round2(computedLines.reduce((sum, l) => sum + l.cgstAmount, 0));
    const sgstAmount = round2(computedLines.reduce((sum, l) => sum + l.sgstAmount, 0));
    const netAmount = round2(computedLines.reduce((sum, l) => sum + l.netAmount, 0));

    return prisma.$transaction(async (tx) => {
        // 1. Create PoHdr + nested PoDtl rows in a single write
        const po = await purchaseRepository.create(tx, {
            poDate,
            invoiceNumber,
            totalAmount,
            discountAmount,
            cgstAmount,
            sgstAmount,
            netAmount,
            vendor: { connect: { id: vendorId } },
            createdBy: { connect: { id: createdById } },
            details: {
                create: computedLines.map((line) => ({
                    item: { connect: { id: line.itemId } },
                    packQty: line.packQty,
                    looseQty: line.looseQty,
                    totalPieces: line.totalPieces,
                    purchaseRate: line.purchaseRate,
                    lineAmount: line.lineAmount,
                    discountPct: line.discountPct,
                    discountAmount: line.discountAmount,
                    cgstPct: line.cgstPct,
                    sgstPct: line.sgstPct,
                    netAmount: line.netAmount,
                })),
            },
        });

        // 2. Bump stock for every line — and create the ItemStock row if this
        // is the item's very first-ever purchase (item creation doesn't seed one)
        const ledgerEntries = [];
        for (const line of computedLines) {
            const existingStock = await tx.itemStock.findUnique({
                where: { itemId: line.itemId },
            });

            const updatedStock = existingStock
                ? await stockRepository.increaseStock(tx, line.itemId, line.totalPieces)
                : await stockRepository.create(tx, {
                    item: { connect: { id: line.itemId } },
                    currentStockPieces: line.totalPieces,
                });

            // 3. One ledger row per line, carrying the running balance right after this purchase
            ledgerEntries.push({
                txnDate: poDate,
                item: { connect: { id: line.itemId } },
                txnType: StockTxnType.PURCHASE,
                referenceType: ReferenceType.PO,
                referenceId: po.id,
                qtyInPieces: line.totalPieces,
                qtyOutPieces: 0,
                balanceAfter: updatedStock.currentStockPieces,
                unitCost: line.purchaseRate,
                createdBy: { connect: { id: createdById } },
            });
        }

        await ledgerRepository.createMany(tx, ledgerEntries);

        return po;
    });
};

const ListPurchases = async (vendorId?: number, startDate?: Date, endDate?: Date) => {
    if (vendorId) {
        return purchaseRepository.getPurchasesByVendor(vendorId);
    }
    if (startDate && endDate) {
        return purchaseRepository.getPurchasesByDateRange(startDate, endDate);
    }
    return purchaseRepository.getAllPurchases();
};

const GetPurchaseById = async (id: number) => {
    const purchase = await purchaseRepository.getPurchaseById(id);
    if (!purchase) {
        throw new NotFoundError("Purchase order not found.");
    }
    return purchase;
};

export const purchaseService = {
    CreatePurchase,
    ListPurchases,
    GetPurchaseById,
};