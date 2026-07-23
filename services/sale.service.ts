// services/sale.service.ts
import prisma from "@/lib/prisma";
import { ReferenceType, StockTxnType } from "@/lib/generated/prisma/client";
import { DiscountAttribute, PaymentStatus } from "@/lib/generated/prisma/enums";

import { saleRepository } from "@/repositories/sale.repository";
import { saleDetailRepository } from "@/repositories/sale.repository-detail";
import { stockRepository } from "@/repositories/stock.repository";
import { ledgerRepository } from "@/repositories/ledger.repository";
import { discountRepository } from "@/repositories/discount.repository";
import { customerRepository } from "@/repositories/customer.repository";
import { itemRepository } from "@/repositories/item.repository";

import {
    NotFoundError,
    BadRequestError,
    ConflictError,
} from "@/lib/response";

import type {
    CreateSaleInput,
    UpdatePaymentStatusInput,
} from "@/validation/sale.validation";

// ── Internal helpers (not exported — pure calculation, no DB/business rules) ──

function round2(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computeManualDiscount(
    baseAmount: number,
    discount: { type: "PERCENT" | "FLAT"; value: number } | undefined
) {
    if (!discount) return 0;

    const raw =
        discount.type === "PERCENT"
            ? (baseAmount * discount.value) / 100
            : discount.value;

    return Math.min(Math.max(round2(raw), 0), baseAmount);
}

export const saleService = {
    // ── Create ───────────────────────────────────────────────────

    async CreateSale(input: CreateSaleInput, userId: number) {
        const customer = await customerRepository.getCustomerById(
            input.customerId
        );
        if (!customer) {
            throw new NotFoundError(
                `Customer ${input.customerId} does not exist`
            );
        }

        // Load every item referenced in the bill once
        const itemIds = [...new Set(input.details.map((d) => d.itemId))];
        const items = await Promise.all(
            itemIds.map((id) => itemRepository.getItemById(id))
        );

        const itemMap = new Map<number, NonNullable<(typeof items)[number]>>();
        items.forEach((item, idx) => {
            if (!item) {
                throw new NotFoundError(
                    `Item ${itemIds[idx]} does not exist`
                );
            }
            if (!item.isActive) {
                throw new BadRequestError(
                    `Item ${item.itemCode} is not active`
                );
            }
            itemMap.set(item.id, item);
        });

        // Build base line data: quantities, gross amount, manual discount
        type Line = {
            itemId: number;
            item: NonNullable<(typeof items)[number]>;
            packQty: number;
            looseQty: number;
            totalPieces: number;
            saleRate: number;
            lineAmount: number;
            manualDiscountAmount: number;
            defaultDiscountAmount: number;
        };

        const lines: Line[] = input.details.map((detail) => {
            const item = itemMap.get(detail.itemId)!;
            const totalPieces =
                detail.packQty * item.packSize + detail.looseQty;

            if (totalPieces <= 0) {
                throw new BadRequestError(
                    `Quantity for item ${item.itemCode} must be greater than 0`
                );
            }

            const lineAmount = round2(detail.saleRate * totalPieces);
            const manualDiscountAmount = computeManualDiscount(
                lineAmount,
                detail.discount
            );

            return {
                itemId: detail.itemId,
                item,
                packQty: detail.packQty,
                looseQty: detail.looseQty,
                totalPieces,
                saleRate: detail.saleRate,
                lineAmount,
                manualDiscountAmount,
                defaultDiscountAmount: 0,
            };
        });

        // Stock sufficiency pre-check (see known race-condition note in
        // stockService.AdjustStock — same tradeoff applies here)
        for (const line of lines) {
            const stock = await stockRepository.getStockByItemId(
                line.itemId
            );
            if (!stock || stock.currentStockPieces < line.totalPieces) {
                throw new ConflictError(
                    `Insufficient stock for item ${line.item.itemCode}. Available: ${stock?.currentStockPieces ?? 0
                    }, requested: ${line.totalPieces}`
                );
            }
        }

        // Bill-level toggle: auto-apply eligible default discounts across
        // the whole bill. A discount only applies if BOTH the trigger item
        // (onItemId) and the target item (discountedItemId) are present as
        // line items in this bill.
        if (input.applyDefaultDiscounts) {
            const currentDiscounts = await discountRepository.getCurrentDiscounts(
                input.billDate
            );
            const lineByItemId = new Map(lines.map((l) => [l.itemId, l]));

            for (const discount of currentDiscounts) {
                const triggerLine = lineByItemId.get(discount.onItemId);
                const targetLine = lineByItemId.get(discount.discountedItemId);

                if (!triggerLine || !targetLine) continue;

                const qualifyingQty =
                    discount.perAttribute === DiscountAttribute.PER_ITEM
                        ? triggerLine.totalPieces
                        : discount.perAttribute === DiscountAttribute.PER_PACK
                            ? triggerLine.packQty
                            : triggerLine.lineAmount; // PER_AMOUNT

                if (qualifyingQty < Number(discount.attributeQty)) continue;

                const discountValue =
                    discount.discountedAttribute === DiscountAttribute.PER_ITEM
                        ? Number(discount.discountedQty) * targetLine.saleRate
                        : discount.discountedAttribute ===
                            DiscountAttribute.PER_PACK
                            ? Number(discount.discountedQty) *
                            targetLine.item.packSize *
                            targetLine.saleRate
                            : Number(discount.discountedQty); // PER_AMOUNT

                const remainingRoom =
                    targetLine.lineAmount - targetLine.manualDiscountAmount;

                targetLine.defaultDiscountAmount = round2(
                    Math.min(
                        remainingRoom,
                        targetLine.defaultDiscountAmount + discountValue
                    )
                );
            }
        }

        // Finalize each line: total discount, GST, net amount
        const finalizedLines = lines.map((line) => {
            const discountAmount = round2(
                line.manualDiscountAmount + line.defaultDiscountAmount
            );
            const taxableAmount = round2(line.lineAmount - discountAmount);
            const discountPct =
                line.lineAmount > 0
                    ? round2((discountAmount / line.lineAmount) * 100)
                    : 0;

            const gstPct = Number(line.item.gstPct);
            const cgstPct = round2(gstPct / 2);
            const sgstPct = round2(gstPct / 2);
            const cgstAmount = round2((taxableAmount * cgstPct) / 100);
            const sgstAmount = round2((taxableAmount * sgstPct) / 100);
            const netAmount = round2(taxableAmount + cgstAmount + sgstAmount);

            return {
                ...line,
                discountAmount,
                discountPct,
                cgstPct,
                sgstPct,
                cgstAmount,
                sgstAmount,
                netAmount,
            };
        });

        // Bill-level totals
        const totalAmount = round2(
            finalizedLines.reduce((sum, l) => sum + l.lineAmount, 0)
        );
        const lineDiscountTotal = round2(
            finalizedLines.reduce((sum, l) => sum + l.discountAmount, 0)
        );
        const cgstAmount = round2(
            finalizedLines.reduce((sum, l) => sum + l.cgstAmount, 0)
        );
        const sgstAmount = round2(
            finalizedLines.reduce((sum, l) => sum + l.sgstAmount, 0)
        );
        const subtotalAfterLines = round2(
            finalizedLines.reduce((sum, l) => sum + l.netAmount, 0)
        );

        // Bill-level manual discount is a flat reduction on the final
        // payable amount (not re-proportioned across GST), stacked on top
        // of whatever line-level and default discounts already applied.
        const billDiscountAmount = computeManualDiscount(
            subtotalAfterLines,
            input.billDiscount
        );

        const netAmount = round2(subtotalAfterLines - billDiscountAmount);
        const discountAmount = round2(lineDiscountTotal + billDiscountAmount);

        return prisma.$transaction(async (tx) => {
            const bill = await saleRepository.create(tx, {
                billDate: input.billDate,
                paymentStatus: input.paymentStatus,
                totalAmount,
                discountAmount,
                cgstAmount,
                sgstAmount,
                netAmount,
                customer: { connect: { id: input.customerId } },
                createdBy: { connect: { id: userId } },
                details: {
                    create: finalizedLines.map((line) => ({
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
                        item: { connect: { id: line.itemId } },
                    })),
                },
            });

            for (const line of finalizedLines) {
                const updatedStock = await stockRepository.decreaseStock(
                    tx,
                    line.itemId,
                    line.totalPieces
                );

                await ledgerRepository.create(tx, {
                    txnDate: input.billDate,
                    txnType: StockTxnType.SALE,
                    referenceType: ReferenceType.BILL,
                    referenceId: bill.id,
                    qtyOutPieces: line.totalPieces,
                    balanceAfter: updatedStock.currentStockPieces,
                    unitPrice: line.saleRate,
                    item: { connect: { id: line.itemId } },
                    createdBy: { connect: { id: userId } },
                });
            }

            return bill;
        });
    },

    // ── Reads ────────────────────────────────────────────────────

    async GetSaleById(id: number) {
        const sale = await saleRepository.getSaleById(id);

        if (!sale) {
            throw new NotFoundError(`Sale ${id} does not exist`);
        }

        return sale;
    },

    async ListSales(
        customerId?: number,
        paymentStatus?: PaymentStatus,
        startDate?: Date,
        endDate?: Date
    ) {
        if (startDate && endDate) {
            return saleRepository.getSalesByDateRange(startDate, endDate);
        }

        if (customerId) {
            return saleRepository.getSalesByCustomer(customerId);
        }

        if (paymentStatus) {
            return saleRepository.getSalesByPaymentStatus(paymentStatus);
        }

        return saleRepository.getAllSales();
    },

    // ── Payment status ───────────────────────────────────────────

    async UpdatePaymentStatus(id: number, input: UpdatePaymentStatusInput) {
        const sale = await saleRepository.getSaleById(id);

        if (!sale) {
            throw new NotFoundError(`Sale ${id} does not exist`);
        }

        return saleRepository.updatePaymentStatus(id, input.paymentStatus);
    },

    // ── Cancel ───────────────────────────────────────────────────

    async CancelSale(id: number) {
        const sale = await saleRepository.getSaleForStockRollback(id);

        if (!sale) {
            throw new NotFoundError(`Sale ${id} does not exist`);
        }

        return prisma.$transaction(async (tx) => {
            for (const detail of sale.details) {
                await stockRepository.increaseStock(
                    tx,
                    detail.itemId,
                    detail.totalPieces
                );
            }

            await ledgerRepository.deleteByReference(
                tx,
                ReferenceType.BILL,
                id
            );
            await saleDetailRepository.deleteByBillId(tx, id);
            await saleRepository.deleteSale(tx, id);
        });
    },
};