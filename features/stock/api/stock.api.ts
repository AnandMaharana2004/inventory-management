import type { StockRecord, CreateOpeningStockPayload, AdjustStockPayload } from "../types/stock";

export async function getStocks(lowStock?: boolean): Promise<StockRecord[]> {
  const url = lowStock ? "/api/stock?lowStock=true" : "/api/stock";
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to query the stock registry matrix.");
  }

  const json = await response.json();
  return json.data;
}

export async function createOpeningStock(payload: CreateOpeningStockPayload): Promise<StockRecord> {
  const response = await fetch("/api/stock/opening", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to commit opening stock initialization.");
  }

  const json = await response.json();
  return json.data;
}

export async function adjustStock(payload: AdjustStockPayload): Promise<StockRecord> {
  const response = await fetch("/api/stock/adjust", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to execute standard stock ledger modification.");
  }

  const json = await response.json();
  return json.data;
}