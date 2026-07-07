import type { Item, ItemStatusFilter, CreateItemPayload, UpdateItemPayload } from "../types/item";

export async function getItems(search?: string, status: ItemStatusFilter = "all"): Promise<Item[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("status", status);

  const response = await fetch(`/api/items?${params.toString()}`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch item catalog.");
  }

  const json = await response.json();
  return json.data;
}

export async function createItem(payload: CreateItemPayload): Promise<Item> {
  const response = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create item.");
  }

  const json = await response.json();
  return json.data;
}

export async function updateItem(id: number, payload: UpdateItemPayload): Promise<Item> {
  const response = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update item.");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteItem(id: number): Promise<void> {
  const response = await fetch(`/api/items/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete item.");
  }
}

export async function activateItem(id: number): Promise<Item> {
  const response = await fetch(`/api/items/${id}/active`, { method: "PATCH" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to activate item.");
  }

  const json = await response.json();
  return json.data;
}

export async function deactivateItem(id: number): Promise<Item> {
  const response = await fetch(`/api/items/${id}/deactivate`, { method: "PATCH" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to deactivate item.");
  }

  const json = await response.json();
  return json.data;
}