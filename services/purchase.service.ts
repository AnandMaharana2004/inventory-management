import prisma from "@/lib/prisma";
import { ReferenceType, StockTxnType } from "@/lib/generated/prisma/client";
import { BadRequestError, NotFoundError } from "@/lib/response";
import { purchaseRepository } from "@/repositories/purchase.repository";
import { stockRepository } from "@/repositories/stock.repository";
import { ledgerRepository } from "@/repositories/ledger.repository";
import { itemRepository } from "@/repositories/item.repository";
import { vendorRepository } from "@/repositories/vendor.repository";
import type { CreatePurchaseInput } from "@/validation/purchase.validation";


const round2 = (n: number) => Math.round(n * 100) / 100;

type PurchaseDetailInput = CreatePurchaseInput["details"][number];

const computePurchaseLine = (
    line: PurchaseDetailInput,
    item: { packSize: number; gstPct: number }
) => {
    // Stage 1: quantity calculation
    const totalPieces = line.packQty * item.packSize + line.looseQty;

    const isPackRate = line.rateBasis.startsWith("PACK");
    const isInclGst = line.rateBasis.endsWith("INCL_GST");
    const enteredPieceRate = isPackRate
        ? line.purchaseRate / item.packSize
        : line.purchaseRate;

    const gstPct = item.gstPct;
    const pieceRateExclGst = isInclGst
        ? enteredPieceRate / (1 + gstPct / 100)
        : enteredPieceRate;
    const pieceRateInclGst = isInclGst
        ? enteredPieceRate
        : enteredPieceRate * (1 + gstPct / 100);


    const lineAmount = totalPieces * pieceRateExclGst;
    const discountAmount = (lineAmount * line.discountPct) / 100;
    const taxableAmount = lineAmount - discountAmount;

    const cgstPct = gstPct / 2;
    const sgstPct = gstPct / 2;
    const cgstAmount = (taxableAmount * cgstPct) / 100;
    const sgstAmount = (taxableAmount * sgstPct) / 100;


    const netAmount = taxableAmount + cgstAmount + sgstAmount;

    return {
        itemId: line.itemId,
        packQty: line.packQty,
        looseQty: line.looseQty,
        totalPieces,
        purchaseRate: line.purchaseRate, // raw entered value, kept only for audit
        rateBasis: line.rateBasis,
        pieceRateExclGst, // normalized per-piece cost, excl GST — used for unitCost
        pieceRateInclGst,
        lineAmount,
        discountPct: line.discountPct,
        discountAmount,
        taxableAmount,
        cgstPct,
        sgstPct,
        cgstAmount,
        sgstAmount,
        netAmount,
    };
};

const CreatePurchase = async (body: CreatePurchaseInput, createdById: number) => {
    const { poDate, invoiceNumber, vendorId, details } = body;

    const vendor = await vendorRepository.getVendorById(vendorId);
    if (!vendor) {
        throw new BadRequestError("Vendor does not exist.");
    }

    const computedLines = await Promise.all(
        details.map(async (line) => {
            const item = await itemRepository.getItemById(line.itemId);
            if (!item) throw new BadRequestError(`Item with id ${line.itemId} does not exist.`);
            if (!item.isActive) throw new BadRequestError(`Item "${item.itemDesc}" is inactive and cannot be purchased.`);

            return computePurchaseLine(line, {
                packSize: item.packSize,
                gstPct: item.gstPct.toNumber(),
            });
        })
    );

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
                    rateBasis: line.rateBasis,
                    lineAmount: round2(line.lineAmount),
                    discountPct: line.discountPct,
                    discountAmount: round2(line.discountAmount),
                    cgstPct: round2(line.cgstPct),
                    sgstPct: round2(line.sgstPct),
                    netAmount: round2(line.netAmount),
                })),
            },
        });

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

            ledgerEntries.push({
                txnDate: poDate,
                item: { connect: { id: line.itemId } },
                txnType: StockTxnType.PURCHASE,
                referenceType: ReferenceType.PO,
                referenceId: po.id,
                qtyInPieces: line.totalPieces,
                qtyOutPieces: 0,
                balanceAfter: updatedStock.currentStockPieces,
                unitCost: round2(line.pieceRateExclGst),
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