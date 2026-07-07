import type { UserRole } from "./types/user";


export const USER_ROLE_OPTIONS: { label: string; value: UserRole }[] = [
    { label: "Administrator", value: "ADMIN" },
    { label: "Manager", value: "MANAGER" },
    { label: "Salesman", value: "SALESMAN" },
];

export const DEFAULT_USER_FORM_VALUES = {
    name: "",
    email: "",
    role: "SALESMAN" as UserRole,
    contactNumber: "",
    password: "",
};