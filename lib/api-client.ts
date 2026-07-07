type ApiEnvelope<T> = {
    message: string;
    data: T;
};

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        ...options,
        // Assumes session is carried via an httpOnly cookie set at login.
        // If you're using a Bearer token from localStorage instead, swap this
        // for an Authorization header here — this is the ONE place that needs to change.
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(json?.message ?? "Something went wrong.", response.status);
    }

    return (json as ApiEnvelope<T>).data;
}

export const apiClient = {
    get: <T>(url: string) => apiFetch<T>(url),
    post: <T>(url: string, body: unknown) =>
        apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) }),
    patch: <T>(url: string, body: unknown) =>
        apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};