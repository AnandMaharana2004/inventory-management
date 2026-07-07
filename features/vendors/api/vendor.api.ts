import type { Vendor, CreateVendorPayload, UpdateVendorPayload } from "../types/vendor";

export async function getVendors(search?: string): Promise<Vendor[]> {
  const url = search ? `/api/vendors?search=${encodeURIComponent(search)}` : "/api/vendors";
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch vendor list.");
  }

  const json = await response.json();
  return json.data;
}

export async function createVendor(payload: CreateVendorPayload): Promise<Vendor> {
  const response = await fetch("/api/vendors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create vendor.");
  }

  const json = await response.json();
  return json.data;
}

export async function updateVendor(id: number, payload: UpdateVendorPayload): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update vendor.");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteVendor(id: number): Promise<void> {
  const response = await fetch(`/api/vendors/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete vendor.");
  }
}