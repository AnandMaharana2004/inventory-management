import type { ItemStatusFilter } from "./types/item";

export const ITEM_STATUS_FILTERS: { label: string; value: ItemStatusFilter }[] = [
  { label: "All Items", value: "all" },
  { label: "Active Only", value: "active" },
];

export const DEFAULT_ITEM_FORM_VALUES = {
  itemCode: "",
  itemDesc: "",
  hsnCode: "",
  category: "",
  brand: "",
  packSize: 1,
  unitName: "",
  gstPct: 0,
  reorderLevel: 0,
};