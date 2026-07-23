import type { PaymentStatus } from "./types/sale";

export const PAYMENT_STATUS_OPTIONS: { label: string; value: PaymentStatus }[] = [
  { label: "Fully Paid Settlement", value: "PAID" },
  { label: "Partial Settlement", value: "PARTIAL" },
  { label: "Pending Collection", value: "PENDING" },
];

export const DEFAULT_SALE_LINE_VALUES = {
  itemId: 0,
  packQty: 0,
  looseQty: 0,
  saleRate: 0,
  hasLineDiscount: false,
  lineDiscountType: "PERCENT" as const,
  lineDiscountValue: 0,
};

export const DEFAULT_SALE_FORM_VALUES = {
  billDate: new Date().toISOString().split("T")[0],
  customerId: 0,
  paymentStatus: "PENDING" as PaymentStatus,
  applyDefaultDiscounts: true,
  hasBillDiscount: false,
  billDiscountType: "FLAT" as const,
  billDiscountValue: 0,
  details: [],
};