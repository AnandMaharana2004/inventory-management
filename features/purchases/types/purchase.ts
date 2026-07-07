export type PurchaseMode = "create" | "view";

export type RateBasis = "PIECE_EXCL_GST" | "PIECE_INCL_GST" | "PACK_EXCL_GST" | "PACK_INCL_GST";

export type PurchaseItemDetail = {
  id: number;
  poId: number;
  itemId: number;
  packQty: number;
  looseQty: number;
  totalPieces: number;
  purchaseRate: number;
  lineAmount: number;
  discountPct: number;
  discountAmount: number;
  cgstPct: number;
  sgstPct: number;
  netAmount: number;
  rateBasis: RateBasis;
  item?: {
    id: number;
    itemCode: string;
    itemDesc: string;
    packSize: number;
    unitName: string;
  };
};

export type Purchase = {
  id: number;
  poDate: string;
  invoiceNumber: string | null;
  totalAmount: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  netAmount: number;
  vendorId: number;
  createdById: number;
  createdAt: string;
  vendor?: {
    id: number;
    name: string;
    gstin: string | null;
  };
  createdBy?: {
    id: number;
    name: string;
  };
  details?: PurchaseItemDetail[];
};

export type CreatePurchaseDetailPayload = {
  itemId: number;
  packQty: number;
  looseQty: number;
  purchaseRate: number;
  discountPct: number;
  rateBasis: RateBasis;
};

export type CreatePurchasePayload = {
  poDate: string;
  invoiceNumber?: string;
  vendorId: number;
  details: CreatePurchaseDetailPayload[];
};