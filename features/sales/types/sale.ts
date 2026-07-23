export type SaleMode = "create" | "view";

export type PaymentStatus = "PAID" | "PARTIAL" | "PENDING";

export type DiscountType = "PERCENT" | "FLAT";

export type ManualDiscountPayload = {
  type: DiscountType;
  value: number;
};

export type SaleItemDetail = {
  id: number;
  billId: number;
  itemId: number;
  packQty: number;
  looseQty: number;
  totalPieces: number;
  saleRate: number;
  lineAmount: number;
  discountPct: number;
  discountAmount: number;
  cgstPct: number;
  sgstPct: number;
  netAmount: number;
  item?: {
    id: number;
    itemCode: string;
    itemDesc: string;
    packSize: number;
    unitName: string;
  };
};

export type Sale = {
  id: number;
  billDate: string;
  customerId: number;
  createdById: number;
  totalAmount: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    gstin: string | null;
  };
  createdBy?: {
    id: number;
    name: string;
  };
  details?: SaleItemDetail[];
};

export type CreateSaleDetailPayload = {
  itemId: number;
  packQty: number;
  looseQty: number;
  saleRate: number;
  discount?: ManualDiscountPayload;
};

export type CreateSalePayload = {
  billDate: string;
  customerId: number;
  paymentStatus: PaymentStatus;
  applyDefaultDiscounts: boolean;
  billDiscount?: ManualDiscountPayload;
  details: CreateSaleDetailPayload[];
};