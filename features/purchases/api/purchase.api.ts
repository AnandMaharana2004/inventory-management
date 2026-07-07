import type { Purchase, CreatePurchasePayload } from "../types/purchase";

export async function getPurchases(filters?: { vendorId?: number; startDate?: string; endDate?: string }): Promise<Purchase[]> {
    const params = new URLSearchParams();
    if (filters?.vendorId) params.append("vendorId", String(filters.vendorId));
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await fetch(`/api/purchases?${params.toString()}`, { method: "GET" });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch purchases ledger index.");
    }

    const json = await response.json();
    return json.data;
}

export async function getPurchaseById(id: number): Promise<Purchase> {
    const response = await fetch(`/api/purchases/${id}`, { method: "GET" });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to retrieve individual purchase order document.");
    }

    const json = await response.json();
    return json.data;
}

export async function createPurchase(payload: CreatePurchasePayload): Promise<Purchase> {
    const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to execute transactional purchase order creation.");
    }

    const json = await response.json();
    return json.data;
}