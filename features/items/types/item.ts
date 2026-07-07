export type ItemMode = "create" | "edit" | "view";

export type ItemStatusFilter = "all" | "active";

export type ItemStockMinimal = {
  itemId: number;
  currentStockPieces: number;
  updatedAt: string;
};

export type Item = {
  id: number;
  itemCode: string;
  itemDesc: string;
  hsnCode: string | null;
  category: string | null;
  brand: string | null;
  packSize: number;
  unitName: string;
  gstPct: number; // Parsed value from backend Decimal representation
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock?: ItemStockMinimal | null;
};

export type CreateItemPayload = {
  itemCode: string;
  itemDesc: string;
  hsnCode?: string;
  category?: string;
  brand?: string;
  packSize: number;
  unitName: string;
  gstPct: number;
  reorderLevel?: number;
};

export type UpdateItemPayload = Partial<CreateItemPayload>;