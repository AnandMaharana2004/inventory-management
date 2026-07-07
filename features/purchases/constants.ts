import type { RateBasis } from "./types/purchase";

export const RATE_BASIS_OPTIONS: { label: string; value: RateBasis }[] = [
  { label: "Per Piece (Excl. GST)", value: "PIECE_EXCL_GST" },
  { label: "Per Piece (Incl. GST)", value: "PIECE_INCL_GST" },
  { label: "Per Pack (Excl. GST)", value: "PACK_EXCL_GST" },
  { label: "Per Pack (Incl. GST)", value: "PACK_INCL_GST" },
];

export const DEFAULT_PURCHASE_LINE_VALUES = {
  itemId: 0,
  packQty: 0,
  looseQty: 0,
  purchaseRate: 0,
  discountPct: 0,
  rateBasis: "PIECE_EXCL_GST" as RateBasis,
};

export const DEFAULT_PURCHASE_FORM_VALUES = {
  poDate: new Date().toISOString().split("T")[0],
  invoiceNumber: "",
  vendorId: 0,
  details: [],
};