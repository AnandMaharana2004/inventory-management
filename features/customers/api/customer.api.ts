import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "../types/customer";

export async function getCustomers(search?: string): Promise<Customer[]> {
    const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : "/api/customers";
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch customer registry.");
    }

    const json = await response.json();
    return json.data;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create customer.");
    }

    const json = await response.json();
    return json.data;
}

export async function updateCustomer(id: number, payload: UpdateCustomerPayload): Promise<Customer> {
    const response = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update customer.");
    }

    const json = await response.json();
    return json.data;
}

export async function deleteCustomer(id: number): Promise<void> {
    const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete customer.");
    }
}