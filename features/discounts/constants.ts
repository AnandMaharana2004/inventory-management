import type { DiscountFilter, DiscountAttribute } from "./types/discount";

export const DISCOUNT_FILTERS: { label: string; value: DiscountFilter }[] = [
    { label: "Current Discounts", value: "current" },
    { label: "Active Status", value: "active" },
    { label: "All Records", value: "all" },
];

export const ATTRIBUTE_OPTIONS: { label: string; value: DiscountAttribute }[] = [
    { label: "Per Item", value: "PER_ITEM" },
    { label: "Per Pack", value: "PER_PACK" },
    { label: "Per Amount", value: "PER_AMOUNT" },
];

export const DEFAULT_FORM_VALUES = {
    onItemId: undefined,
    discountedItemId: undefined,
    perAttribute: "PER_ITEM" as DiscountAttribute,
    attributeQty: 0,
    discountedAttribute: "PER_ITEM" as DiscountAttribute,
    discountedQty: 0,
    startDate: "",
    endDate: "",
};