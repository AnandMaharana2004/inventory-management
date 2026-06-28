import { ledgerRepository } from "@/repositories/ledger.repository";
import { NotFoundError } from "@/lib/response";
import type { LedgerQueryInput } from "@/validation/ledger.validation";

const ListLedger = async (query: LedgerQueryInput) => {
    const { itemId, referenceType, referenceId, startDate, endDate } = query;

    // Most specific filter wins — reference lookup is the most targeted,
    // then item, then date range, then fall back to "everything by item" as a default
    if (referenceType && referenceId) {
        return ledgerRepository.getLedgerByReference(referenceType, referenceId);
    }
    if (startDate && endDate) {
        return ledgerRepository.getLedgerByDateRange(startDate, endDate);
    }
    if (itemId) {
        return ledgerRepository.getLedgerByItem(itemId);
    }

    // No filter at all — date range is the safest unbounded fallback to avoid
    // accidentally dumping the entire ledger table. Default to last 30 days.
    const defaultEnd = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    return ledgerRepository.getLedgerByDateRange(defaultStart, defaultEnd);
};

const GetLedgerById = async (id: number) => {
    const entry = await ledgerRepository.getLedgerById(id);
    if (!entry) {
        throw new NotFoundError("Ledger entry not found.");
    }
    return entry;
};

const GetItemLastLedger = async (itemId: number) => {
    const entry = await ledgerRepository.getItemLastLedger(itemId);
    if (!entry) {
        throw new NotFoundError("No ledger entries found for this item.");
    }
    return entry;
};

export const ledgerService = {
    ListLedger,
    GetLedgerById,
    GetItemLastLedger,
};