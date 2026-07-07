export type CustomerMode = "create" | "edit" | "view";

export type Customer = {
  id: number;
  name: string;
  mobileNo: string | null;
  gstin: string | null;
  contactPerson: string | null;
  address: string | null;
  city: string | null;
  createdAt: string;
};

export type CreateCustomerPayload = {
  name: string;
  mobileNo?: string;
  gstin?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
};

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;