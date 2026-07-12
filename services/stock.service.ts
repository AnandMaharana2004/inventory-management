import prisma from "@/lib/prisma";
import { ReferenceType, StockTxnType } from "@/lib/generated/prisma/client";

import { stockRepository } from "@/repositories/stock.repository";
import { ledgerRepository } from "@/repositories/ledger.repository";
import { itemRepository } from "@/repositories/item.repository";

import {
    NotFoundError,
    BadRequestError,
    ConflictError,
} from "@/lib/response";

import type {
    CreateOpeningStockInput,
    AdjustStockInput,
} from "@/validation/stock.validation";

export const stockService = {
    // ── Reads ─────────────────────────────────────────────────────

    async GetStockByItemId(itemId: number) {
        const stock = await stockRepository.getStockByItemId(itemId);

        if (!stock) {
            throw new NotFoundError(
                `Stock record not found for item ${itemId}`
            );
        }

        return stock;
    },

    async GetAllStocks() {
        return stockRepository.getAllStocks();
    },

    async GetLowStockItems() {
        return stockRepository.getLowStockItems();
    },

    // ── Opening Stock ────────────────────────────────────────────

    async CreateOpeningStock(
        input: CreateOpeningStockInput,
        userId: number
    ) {
        const item = await itemRepository.getItemById(input.itemId);

        if (!item) {
            throw new NotFoundError(
                `Item ${input.itemId} does not exist`
            );
        }

        const existingStock = await stockRepository.getStockByItemId(
            input.itemId
        );

        if (existingStock) {
            throw new ConflictError(
                `Opening stock already exists for item ${input.itemId}`
            );
        }

        return prisma.$transaction(async (tx) => {
            const stock = await stockRepository.create(tx, {
                currentStockPieces: input.quantity,
                item: { connect: { id: input.itemId } },
            });

            await ledgerRepository.create(tx, {
                txnDate: new Date(),
                txnType: StockTxnType.OPENING,
                referenceType: ReferenceType.OPENING,
                referenceId: input.itemId,
                qtyInPieces: input.quantity,
                qtyOutPieces: 0,
                balanceAfter: stock.currentStockPieces,
                unitCost: input.unitCost,
                remarks: input.remarks,
                item: { connect: { id: input.itemId } },
                createdBy: { connect: { id: userId } },
            });

            return stock;
        });
    },

    // ── Stock Adjustment ─────────────────────────────────────────

    async AdjustStock(input: AdjustStockInput, userId: number) {
        const stock = await stockRepository.getStockByItemId(
            input.itemId
        );

        if (!stock) {
            throw new NotFoundError(
                `Stock record not found for item ${input.itemId}. Create opening stock first.`
            );
        }

        if (
            input.adjustmentType === "DECREASE" &&
            stock.currentStockPieces < input.quantity
        ) {
            throw new ConflictError(
                `Insufficient stock for item ${input.itemId}. Available: ${stock.currentStockPieces}, requested: ${input.quantity}`
            );
        }

        return prisma.$transaction(async (tx) => {
            const updatedStock =
                input.adjustmentType === "INCREASE"
                    ? await stockRepository.increaseStock(
                        tx,
                        input.itemId,
                        input.quantity
                    )
                    : await stockRepository.decreaseStock(
                        tx,
                        input.itemId,
                        input.quantity
                    );

            await ledgerRepository.create(tx, {
                txnDate: new Date(),
                txnType: StockTxnType.ADJUSTMENT,
                referenceType: ReferenceType.ADJUSTMENT,
                referenceId: input.itemId,
                qtyInPieces:
                    input.adjustmentType === "INCREASE"
                        ? input.quantity
                        : 0,
                qtyOutPieces:
                    input.adjustmentType === "DECREASE"
                        ? input.quantity
                        : 0,
                balanceAfter: updatedStock.currentStockPieces,
                remarks: input.remarks,
                item: { connect: { id: input.itemId } },
                createdBy: { connect: { id: userId } },
            });

            return updatedStock;
        });
    },
};