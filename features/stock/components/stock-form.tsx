"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientOpeningStockSchema, clientAdjustStockSchema, type OpeningStockFormValues, type AdjustStockFormValues } from "../schemas/stock.schema";
import { DEFAULT_OPENING_STOCK_VALUES, DEFAULT_ADJUST_STOCK_VALUES, ADJUSTMENT_TYPE_OPTIONS } from "../constants";
import type { StockRecord, StockMode } from "../types/stock";
import { getItems } from "../../../features/items/api/item.api";
import type { Item } from "../../../features/items/types/item";

interface StockFormProps {
  mode: StockMode;
  initialStock: StockRecord | null;
  isSubmitting: boolean;
  formError: string | null;
  onOpeningSubmit: (values: OpeningStockFormValues) => void;
  onAdjustSubmit: (values: AdjustStockFormValues) => void;
  onCancel: () => void;
}

export function StockForm({
  mode,
  initialStock,
  isSubmitting,
  formError,
  onOpeningSubmit,
  onAdjustSubmit,
  onCancel,
}: StockFormProps) {
  const isViewMode = mode === "view";
  const isOpeningMode = mode === "opening";

  // Form setup for initialization configuration
  const openingForm = useForm<OpeningStockFormValues>({
    resolver: zodResolver(clientOpeningStockSchema),
    defaultValues: {
      itemId: 0,
      quantity: 0,
      unitCost: "" as number | "",
      remarks: "",
    },
  });

  // Form setup for standard ledger item corrections adjustments
  const adjustForm = useForm<AdjustStockFormValues>({
    resolver: zodResolver(clientAdjustStockSchema),
    defaultValues: DEFAULT_ADJUST_STOCK_VALUES,
  });

  // Hydrate correction state targets if preselected
  useEffect(() => {
    if (mode === "adjust" && initialStock) {
      adjustForm.reset({
        itemId: initialStock.itemId,
        adjustmentType: "INCREASE",
        quantity: 0,
        remarks: "",
      });
    }
  }, [initialStock, mode, adjustForm]);

  if (isViewMode && initialStock) {
    const pieces = initialStock.currentStockPieces;
    const size = initialStock.item.packSize;
    const calcPacks = Math.floor(pieces / size);
    const calcLoose = pieces % size;

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4 border p-4 bg-muted/20 rounded-lg">
          <div>
            <span className="text-xs text-muted-foreground uppercase block">Unique Code</span>
            <span className="font-mono font-bold text-sm uppercase">{initialStock.item.itemCode}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase block">Description</span>
            <span className="font-semibold text-sm">{initialStock.item.itemDesc}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase block">Assigned Pack Blueprint</span>
            <span className="text-xs font-medium">1 Pack = {size} {initialStock.item.unitName}s</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase block">Reorder Guard Trigger</span>
            <span className="text-xs font-mono font-bold text-rose-600">{initialStock.item.reorderLevel} Units</span>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex justify-around text-center">
          <div>
            <span className="text-xs text-muted-foreground block">Packs Component</span>
            <span className="text-lg font-bold font-mono">{calcPacks}</span>
          </div>
          <div className="text-2xl text-muted-foreground/40 font-light">+</div>
          <div>
            <span className="text-xs text-muted-foreground block">Loose Loose Units</span>
            <span className="text-lg font-bold font-mono">{calcLoose}</span>
          </div>
          <div className="text-2xl text-muted-foreground/40 font-light">=</div>
          <div>
            <span className="text-xs font-semibold text-primary block">Aggregate Balance (Pieces)</span>
            <span className="text-xl font-black font-mono text-primary">{pieces}</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button type="button" onClick={onCancel} className="h-9 border border-input px-4 rounded-md text-sm font-medium hover:bg-accent cursor-pointer">
            Close Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-1">
      {formError && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 mb-4 font-medium">
          {formError}
        </div>
      )}

      {isOpeningMode ? (
        <form onSubmit={openingForm.handleSubmit(onOpeningSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Select Item Master *</label>
            <StockItemCatalogSelector control={openingForm.control} disabled={isSubmitting} />
            {openingForm.formState.errors.itemId && (
              <p className="text-xs text-destructive font-medium">{openingForm.formState.errors.itemId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Opening Balance (Pieces) *</label>
              <Controller
                name="quantity"
                control={openingForm.control}
                render={({ field }) => (
                  <input
                    type="number"
                    disabled={isSubmitting}
                    className="flex h-9 border border-input rounded-md bg-transparent px-3 text-sm focus-visible:outline-hidden"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                    value={field.value ?? ""}
                  />
                )}
              />
              {openingForm.formState.errors.quantity && (
                <p className="text-xs text-destructive font-medium">{openingForm.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Base Unit Cost (Optional)</label>
              <Controller
                name="unitCost"
                control={openingForm.control}
                render={({ field }) => (
                  <input
                    type="number"
                    step="any"
                    disabled={isSubmitting}
                    className="flex h-9 border border-input rounded-md bg-transparent px-3 text-sm focus-visible:outline-hidden"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                    value={field.value ?? ""}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Internal Audit Remarks</label>
            <Controller
              name="remarks"
              control={openingForm.control}
              render={({ field }) => (
                <input
                  type="text"
                  disabled={isSubmitting}
                  className="flex h-9 border border-input rounded-md bg-transparent px-3 text-sm focus-visible:outline-hidden"
                  placeholder="Seeding stock initialization profile..."
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="h-9 border px-4 rounded-md text-sm font-medium hover:bg-accent cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="h-9 bg-primary text-primary-foreground px-4 rounded-md text-sm font-medium hover:bg-primary/95 cursor-pointer">
              {isSubmitting ? "Seeding..." : "Post Opening Configuration"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={adjustForm.handleSubmit(onAdjustSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Target Stock Item *</label>
            {initialStock ? (
              <input
                type="text"
                disabled
                className="flex h-9 border border-input bg-muted/50 px-3 text-sm rounded-md font-medium"
                value={`[${initialStock.item.itemCode}] ${initialStock.item.itemDesc}`}
              />
            ) : (
              <StockItemCatalogSelector control={adjustForm.control} disabled={isSubmitting} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Adjustment Correction Mode *</label>
              <Controller
                name="adjustmentType"
                control={adjustForm.control}
                render={({ field }) => (
                  <select className="flex h-9 border border-input rounded-md bg-background px-3 text-sm focus-visible:outline-hidden" {...field}>
                    {ADJUSTMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Correction Delta Vol (Pieces) *</label>
              <Controller
                name="quantity"
                control={adjustForm.control}
                render={({ field }) => (
                  <input
                    type="number"
                    disabled={isSubmitting}
                    className="flex h-9 border border-input rounded-md bg-transparent px-3 text-sm focus-visible:outline-hidden"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                    value={field.value ?? ""}
                  />
                )}
              />
              {adjustForm.formState.errors.quantity && (
                <p className="text-xs text-destructive font-medium">{adjustForm.formState.errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Audit Adjust Reason Justification *</label>
            <Controller
              name="remarks"
              control={adjustForm.control}
              render={({ field }) => (
                <input
                  type="text"
                  disabled={isSubmitting}
                  className="flex h-9 border border-input rounded-md bg-transparent px-3 text-sm focus-visible:outline-hidden"
                  placeholder="e.g. Discrepancy correction found during internal physical verification count..."
                  {...field}
                />
              )}
            />
            {adjustForm.formState.errors.remarks && (
              <p className="text-xs text-destructive font-medium">{adjustForm.formState.errors.remarks.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="h-9 border px-4 rounded-md text-sm font-medium hover:bg-accent cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="h-9 bg-primary text-primary-foreground px-4 rounded-md text-sm font-medium hover:bg-primary/95 cursor-pointer">
              {isSubmitting ? "Committing Logs..." : "Commit Ledger Adjust"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * Isolated Live Catalogue Popover Search Component
 */
function StockItemCatalogSelector({ control, disabled }: { control: any; disabled: boolean }) {
  const [term, setTerm] = useState("");
  const [matches, setMatches] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [label, setLabel] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outClick(e: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outClick);
    return () => document.removeEventListener("mousedown", outClick);
  }, []);

  useEffect(() => {
    if (!term.trim()) {
      setMatches([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await getItems(term, "active");
        setMatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [term]);

  return (
    <div ref={areaRef} className="w-full relative">
      <Controller
        name="itemId"
        control={control}
        render={({ field }) => (
          <>
            <input
              type="text"
              disabled={disabled}
              className="flex h-9 w-full border border-input bg-transparent px-3 py-1 text-sm rounded-md focus-visible:outline-hidden"
              placeholder="🔍 Filter by keyword item profiles or codes..."
              value={open ? term : label || (field.value ? `Item Code Key: #${field.value}` : "")}
              onFocus={() => {
                setTerm("");
                setOpen(true);
              }}
              onChange={(e) => {
                setTerm(e.target.value);
                setOpen(true);
              }}
            />
            {open && (term.length > 0 || matches.length > 0) && (
              <div className="absolute left-0 right-0 top-10 z-50 max-h-48 overflow-y-auto rounded-md border bg-popover p-1 shadow-md text-xs divide-y">
                {searching && <div className="p-2 text-muted-foreground animate-pulse text-center">Searching...</div>}
                {!searching && matches.length === 0 && <div className="p-2 text-muted-foreground text-center">No catalog entries matched</div>}
                {matches.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className="w-full text-left px-3 py-1.5 hover:bg-accent flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      field.onChange(i.id);
                      setLabel(`[${i.itemCode}] ${i.itemDesc}`);
                      setOpen(false);
                    }}
                  >
                    <div>
                      <span className="font-bold font-mono text-primary mr-1 border px-1 rounded bg-muted text-[10px] uppercase">{i.itemCode}</span>
                      <span>{i.itemDesc}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Pack Dimensions: {i.packSize}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}