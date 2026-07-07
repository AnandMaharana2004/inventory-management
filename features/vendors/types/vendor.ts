export type VendorMode = "create" | "edit" | "view";

export type Vendor = {
    id: number;
    name: string;
    gstin: string | null;
    location: string | null;
    contactPerson: string | null;
    contactNumber: string | null;
    email: string | null;
    createdAt: string;
};

export type CreateVendorPayload = {
    name: string;
    gstin?: string;
    location?: string;
    contactPerson?: string;
    contactNumber?: string;
    email?: string;
};

export type UpdateVendorPayload = Partial<CreateVendorPayload>;