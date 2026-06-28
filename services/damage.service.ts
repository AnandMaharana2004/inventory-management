import prisma from "@/lib/prisma";
import { ReferenceType, StockTxnType } from "@/lib/generated/prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/response";
import { damageRepository } from "@/repositories/damage.repository";
import { stockRepository } from "@/repositories/stock.repository";
import { ledgerRepository } from "@/repositories/ledger.repository";
import { itemRepository } from "@/repositories/item.repository";
import type { CreateDamageInput } from "@/validation/damage.validation";

const CreateDamage = async (body: CreateDamageInput, createdById: number) => {
    const { damageDate, itemId, packQty, looseQty, reason, estimatedLoss } = body;

    const item = await itemRepository.getItemById(itemId);
    if (!item) {
        throw new BadRequestError("Item does not exist.");
    }

    const totalPieces = packQty * item.packSize + looseQty;

    // Stock sufficiency pre-check — same reasoning as sale: can't write off
    // stock that doesn't exist, fail fast before opening a transaction
    const stock = await stockRepository.getStockByItemId(itemId);
    const available = stock?.currentStockPieces ?? 0;
    if (available < totalPieces) {
        throw new ConflictError(
            `Insufficient stock for item "${item.itemDesc}". Available: ${available}, Required: ${totalPieces}.`
        );
    }

    return prisma.$transaction(async (tx) => {
        // Re-check inside the transaction to narrow the race window
        const currentStock = await tx.itemStock.findUnique({ where: { itemId } });
        const currentAvailable = currentStock?.currentStockPieces ?? 0;
        if (currentAvailable < totalPieces) {
            throw new ConflictError(
                `Insufficient stock for item "${item.itemDesc}". Available: ${currentAvailable}, Required: ${totalPieces}.`
            );
        }

        const damage = await damageRepository.create(tx, {
            damageDate,
            packQty,
            looseQty,
            totalPieces,
            reason,
            estimatedLoss,
            item: { connect: { id: itemId } },
            createdBy: { connect: { id: createdById } },
        });

        const updatedStock = await stockRepository.decreaseStock(tx, itemId, totalPieces);

        await ledgerRepository.create(tx, {
            txnDate: damageDate,
            item: { connect: { id: itemId } },
            txnType: StockTxnType.DAMAGE,
            referenceType: ReferenceType.DAMAGE,
            referenceId: damage.id,
            qtyInPieces: 0,
            qtyOutPieces: totalPieces,
            balanceAfter: updatedStock.currentStockPieces,
            remarks: reason,
            createdBy: { connect: { id: createdById } },
        });

        return damage;
    });
};

const ListDamages = async (itemId?: number, startDate?: Date, endDate?: Date) => {
    if (itemId) {
        return damageRepository.getDamagesByItem(itemId);
    }
    if (startDate && endDate) {
        return damageRepository.getDamagesByDateRange(startDate, endDate);
    }
    return damageRepository.getAllDamages();
};

const GetDamageById = async (id: number) => {
    const damage = await damageRepository.getDamageById(id);
    if (!damage) {
        throw new NotFoundError("Damage record not found.");
    }
    return damage;
};

export const damageService = {
    CreateDamage,
    ListDamages,
    GetDamageById,
};