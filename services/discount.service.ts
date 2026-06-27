import { BadRequestError, ConflictError } from "@/lib/response";
import { discountRepository } from "@/repositories/discount.repository";
import { itemRepository } from "@/repositories/item.repository";
import type { CreateDiscountInput } from "@/validation/discount.validation";

const CreateDiscount = async (body: CreateDiscountInput, createdById: number) => {
    const { onItemId, discountedItemId, startDate, endDate } = body;

    // Confirm both items actually exist before wiring up a discount between them
    const onItem = await itemRepository.getItemById(onItemId);
    if (!onItem) {
        throw new BadRequestError("Offer item (onItemId) does not exist.");
    }

    const discountedItem = await itemRepository.getItemById(discountedItemId);
    if (!discountedItem) {
        throw new BadRequestError("Discounted item (discountedItemId) does not exist.");
    }

    const overlapping = await discountRepository.getOverlappingDiscounts(
        onItemId,
        discountedItemId,
        startDate,
        endDate
    );
    if (overlapping.length > 0) {
        throw new ConflictError(
            "An active discount already exists for this item pair in the given date range."
        );
    }

    return discountRepository.create({
        ...body,
        createdById,
    });
};


type DiscountFilter = "all" | "active" | "current";

const ListDiscounts = async (filter: DiscountFilter = "current") => {
    switch (filter) {
        case "all":
            return discountRepository.getAllDiscounts();
        case "active":
            return discountRepository.getActiveDiscounts();
        case "current":
        default:
            // Active AND within date range right now — what billing/sales should use by default
            return discountRepository.getCurrentDiscounts();
    }
};

export const discountService = {
    CreateDiscount,
    ListDiscounts
};