import type { Sale, CreateSalePayload, PaymentStatus } from "../types/sale";

export async function getSales(filters?: { customerId?: number; paymentStatus?: PaymentStatus; startDate?: string; endDate?: string }): Promise<Sale[]> {
  const params = new URLSearchParams();
  if (filters?.customerId) params.append("customerId", String(filters.customerId));
  if (filters?.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await fetch(`/api/sales?${params.toString()}`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch retail sales history registry.");
  }

  const json = await response.json();
  return json.data;
}

export async function getSaleById(id: number): Promise<Sale> {
  const response = await fetch(`/api/sales/${id}`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to load complete sale invoice document details.");
  }

  const json = await response.json();
  return json.data;
}

export async function createSale(payload: CreateSalePayload): Promise<Sale> {
  const response = await fetch("/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to execute corporate sales invoice transaction.");
  }

  const json = await response.json();
  return json.data;
}

export async function updateSalePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Sale> {
  const response = await fetch(`/api/sales/${id}/payment-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentStatus }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update financial collections status flag.");
  }

  const json = await response.json();
  return json.data;
}