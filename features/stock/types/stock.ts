export type StockAdjustmentType = "INCREASE" | "DECREASE";

export type StockMode = "view" | "opening" | "adjust";

export type StockRecord = {
  itemId: number;
  currentStockPieces: number;
  updatedAt: string;
  item: {
    id: number;
    itemCode: string;
    itemDesc: string;
    packSize: number;
    unitName: string;
    reorderLevel: number;
    category: string | null;
    brand: string | null;
  };
};

export type CreateOpeningStockPayload = {
  itemId: number;
  quantity: number;
  unitCost?: number;
  remarks?: string;
};

export type AdjustStockPayload = {
  itemId: number;
  adjustmentType: StockAdjustmentType;
  quantity: number;
  remarks: string;
};