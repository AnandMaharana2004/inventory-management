import type { Discount, DiscountFilter, CreateDiscountPayload } from "../types/discount";

export async function getDiscounts(filter: DiscountFilter = "current"): Promise<Discount[]> {
    const response = await fetch(`/api/discounts?filter=${filter}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch discounts.");
    }

    const json = await response.json();
    return json.data; // Matches your API Wrapper shape: new ApiResponse(..., discounts)
}

export async function createDiscount(payload: CreateDiscountPayload): Promise<Discount> {
    const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create discount.");
    }

    const json = await response.json();
    return json.data;
}