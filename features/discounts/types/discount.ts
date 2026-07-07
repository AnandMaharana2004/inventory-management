export type DiscountAttribute = "PER_ITEM" | "PER_PACK" | "PER_AMOUNT";

export type DiscountMode = "create" | "view";

export type DiscountFilter = "all" | "active" | "current";

export type ItemMinimal = {
  id: number;
  itemCode: string;
  itemDesc: string;
};

export type Discount = {
  id: number;
  onItemId: number;
  discountedItemId: number;
  perAttribute: DiscountAttribute;
  attributeQty: number;
  discountedAttribute: DiscountAttribute;
  discountedQty: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
  // Included relations for the tabular view
  onItem?: ItemMinimal;
  discountedItem?: ItemMinimal;
};

export type CreateDiscountPayload = {
  onItemId: number;
  discountedItemId: number;
  perAttribute: DiscountAttribute;
  attributeQty: number;
  discountedAttribute: DiscountAttribute;
  discountedQty: number;
  startDate: string; // ISO String from form
  endDate: string;   // ISO String from form
};