import type { User, CreateUserPayload, UpdateUserPayload } from "../types/user";

export async function getUsers(search?: string): Promise<User[]> {
  const url = search ? `/api/users?search=${encodeURIComponent(search)}` : "/api/users";
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to retrieve standard users table index.");
  }

  const json = await response.json();
  return json.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to establish new internal user profile.");
  }

  const json = await response.json();
  return json.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to persist core identity mutation alterations.");
  }

  const json = await response.json();
  return json.data;
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to clear user completely from system registry.");
  }
}

export async function activateUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}/active`, { method: "PATCH" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to restore account active state.");
  }

  const json = await response.json();
  return json.data;
}

export async function deactivateUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}/deactivate`, { method: "PATCH" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to restrict authorization entry access flag.");
  }

  const json = await response.json();
  return json.data;
}