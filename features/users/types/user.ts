export type UserMode = "create" | "edit" | "view";

export type UserRole = "ADMIN" | "MANAGER" | "SALESMAN";

export type User = {
    id: number;
    name: string;
    role: UserRole;
    contactNumber: string | null;
    email: string | null;
    isActive: boolean;
    createdAt: string;
};

export type CreateUserPayload = {
    name: string;
    email?: string;
    password?: string;
    role: UserRole;
    contactNumber?: string;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password" | "role">> & {
    role?: UserRole;
};