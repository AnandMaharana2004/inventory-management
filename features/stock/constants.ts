import type { StockAdjustmentType } from "./types/stock";

export const ADJUSTMENT_TYPE_OPTIONS: { label: string; value: StockAdjustmentType }[] = [
  { label: "Stock Influx (+ Increase)", value: "INCREASE" },
  { label: "Stock Deficit (- Decrease)", value: "DECREASE" },
];

export const DEFAULT_OPENING_STOCK_VALUES = {
  itemId: 0,
  quantity: 0,
  unitCost: "",
  remarks: "",
};

export const DEFAULT_ADJUST_STOCK_VALUES = {
  itemId: 0,
  adjustmentType: "INCREASE" as StockAdjustmentType,
  quantity: 0,
  remarks: "",
};