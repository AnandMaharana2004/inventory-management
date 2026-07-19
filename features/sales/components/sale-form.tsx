"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleFormValues } from "../schemas/sale.schema";
import { DEFAULT_SALE_FORM_VALUES, DEFAULT_SALE_LINE_VALUES, PAYMENT_STATUS_OPTIONS } from "../constants";
import type { Sale, SaleMode } from "../types/sale";
import { getItems } from "../../items/api/item.api";
import type { Item } from "../../items/types/item";

interface SaleFormProps {
  mode: SaleMode;
  initialData: Sale | null;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: (values: SaleFormValues) => void;
  onCancel: () => void;
}

export function SaleForm({
  mode,
  initialData,
  isSubmitting,
  formError,
  onSubmit,
  onCancel,
}: SaleFormProps) {
  const isViewMode = mode === "view";
  const [viewItemDetails, setViewItemDetails] = useState<Record<number, string>>({});
  const [initialCustomerLabel, setInitialCustomerLabel] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: DEFAULT_SALE_FORM_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  useEffect(() => {
    if (isViewMode && initialData) {
      reset({
        billDate: new Date(initialData.billDate).toISOString().split("T")[0],
        customerId: initialData.customerId,
        paymentStatus: initialData.paymentStatus,
        details: initialData.details?.map((d) => ({
          itemId: d.itemId,
          packQty: d.packQty,
          looseQty: d.looseQty,
          saleRate: Number(d.saleRate),
        })) || [],
      });

      if (initialData.customer) {
        setInitialCustomerLabel(initialData.customer.name);
      }

      initialData.details?.forEach((line) => {
        if (line.itemId && line.item?.itemCode && line.item?.itemDesc) {
          setViewItemDetails((prev) => ({
            ...prev,
            [line.itemId]: `[${line.item!.itemCode}] ${line.item!.itemDesc}`,
          }));
        }
      });
    } else {
      reset(DEFAULT_SALE_FORM_VALUES);
      setInitialCustomerLabel("");
    }
  }, [initialData, isViewMode, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-1">
      {formError && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
          {formError}
        </div>
      )}

      {/* Top Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Billing Sale Date *</label>
          <Controller
            name="billDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                disabled={isViewMode || isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...field}
              />
            )}
          />
          {errors.billDate && (
            <p className="text-xs font-medium text-destructive">{errors.billDate.message}</p>
          )}
        </div>

        {/* Real-time Customer Selection Lookup input wrapper */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Target Account Customer *</label>
          {isViewMode ? (
            <input
              type="text"
              disabled
              className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-xs"
              value={initialCustomerLabel || `Customer ID: #${initialData?.customerId}`}
            />
          ) : (
            <HeaderCustomerSearchSelector control={control} disabled={isSubmitting} error={errors.customerId?.message} />
          )}
        </div>

        {/* Payment Configuration Select Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Payment Status Mode *</label>
          <Controller
            name="paymentStatus"
            control={control}
            render={({ field }) => (
              <select
                disabled={isViewMode || isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
                {...field}
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      {/* Slidable Items Multi-line dynamic array matrix */}
      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Line Items Itemized Matrix</h4>
          {!isViewMode && (
            <button
              type="button"
              onClick={() => append({ ...DEFAULT_SALE_LINE_VALUES })}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-3 hover:bg-accent cursor-pointer"
            >
              + Append Bill Row
            </button>
          )}
        </div>

        {errors.details && (
          <p className="text-xs font-medium text-destructive">{errors.details.root?.message || errors.details.message}</p>
        )}

        {/* Horizontal Scroll Layout container */}
        <div className="w-full overflow-x-auto border border-border rounded-lg bg-muted/5 max-h-[48vh] overflow-y-auto">
          <div className="min-w-[950px] p-4 space-y-3">
            {/* Header Titles */}
            <div className="grid grid-cols-12 gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 border-b border-border/40 pb-2">
              <div className="col-span-5">Active Catalog Item Quick Search Selection</div>
              <div className="col-span-2 text-center">Pack Qty Vol</div>
              <div className="col-span-2 text-center">Loose Units Qty</div>
              <div className="col-span-2 text-right">Sale Unit Rate (₹)</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-2 rounded-md hover:bg-muted/30 transition-colors">
                {/* Embedded Universal Item Search Dropdown */}
                <div className="col-span-5 relative">
                  {isViewMode ? (
                    <input
                      type="text"
                      disabled
                      className="flex h-8 w-full rounded-md border border-input bg-muted/50 px-2 py-1 text-xs font-medium"
                      value={viewItemDetails[item.itemId] || `Item ID: #${item.itemId}`}
                    />
                  ) : (
                    <InlineItemSearchSelector control={control} index={index} disabled={isSubmitting} />
                  )}
                </div>

                {/* Pack Qty */}
                <div className="col-span-2">
                  <Controller
                    name={`details.${index}.packQty`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        disabled={isViewMode || isSubmitting}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs text-center shadow-xs"
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        value={field.value ?? 0}
                      />
                    )}
                  />
                </div>

                {/* Loose Qty */}
                <div className="col-span-2">
                  <Controller
                    name={`details.${index}.looseQty`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        disabled={isViewMode || isSubmitting}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs text-center shadow-xs"
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        value={field.value ?? 0}
                      />
                    )}
                  />
                </div>

                {/* Sale Rate */}
                <div className="col-span-2">
                  <Controller
                    name={`details.${index}.saleRate`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="any"
                        disabled={isViewMode || isSubmitting}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs text-right shadow-xs"
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </div>

                {/* Row Drop Actions */}
                <div className="col-span-1 text-right">
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Summary Panel */}
      {isViewMode && initialData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-muted/40 border border-border rounded-lg text-sm">
          <div><span className="text-xs block text-muted-foreground uppercase">Gross Item Amt</span><span className="font-bold font-mono">₹{Number(initialData.totalAmount).toFixed(2)}</span></div>
          <div><span className="text-xs block text-muted-foreground uppercase">Autocalc Discount</span><span className="font-bold font-mono text-destructive">₹{Number(initialData.discountAmount).toFixed(2)}</span></div>
          <div><span className="text-xs block text-muted-foreground uppercase">CGST Component</span><span className="font-bold font-mono">₹{Number(initialData.cgstAmount).toFixed(2)}</span></div>
          <div><span className="text-xs block text-muted-foreground uppercase">SGST Component</span><span className="font-bold font-mono">₹{Number(initialData.sgstAmount).toFixed(2)}</span></div>
          <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-border pt-2 md:pt-0 md:pl-3"><span className="text-xs block text-muted-foreground uppercase font-semibold">Net Payable Total</span><span className="font-extrabold font-mono text-emerald-600 text-base">₹{Number(initialData.netAmount).toFixed(2)}</span></div>
        </div>
      )}

      {/* Footer controls buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent h-9 px-4 py-2 cursor-pointer"
        >
          {isViewMode ? "Close Panel" : "Cancel"}
        </button>
        {!isViewMode && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
          >
            {isSubmitting ? "Generating Bill Invoices..." : "Generate Sales Invoice"}
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Real-Time Debounced Customer Search Input Selection Popover component
 */
function HeaderCustomerSearchSelector({ control, disabled, error }: { control: any; disabled: boolean; error?: string }) {
  const [term, setTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOut(e: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  useEffect(() => {
    if (!term.trim()) {
      setCustomers([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/customers?search=${encodeURIComponent(term)}`);
        const json = await response.json();
        setCustomers(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [term]);

  return (
    <div ref={areaRef} className="w-full relative">
      <Controller
        name="customerId"
        control={control}
        render={({ field }) => (
          <>
            <input
              type="text"
              disabled={disabled}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
              placeholder="🔍 Search customer account name or gstin..."
              value={open ? term : selectedLabel || (field.value ? `Customer selected: #${field.value}` : "")}
              onFocus={() => {
                setTerm("");
                setOpen(true);
              }}
              onChange={(e) => {
                setTerm(e.target.value);
                setOpen(true);
              }}
            />
            {open && (term.length > 0 || customers.length > 0) && (
              <div className="absolute left-0 right-0 top-10 z-50 max-h-52 overflow-y-auto rounded-md border bg-popover p-1 shadow-md text-xs divide-y">
                {searching && <div className="p-2 text-muted-foreground animate-pulse text-center">Searching parameters...</div>}
                {!searching && customers.length === 0 && <div className="p-2 text-muted-foreground text-center">No active client matches</div>}
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent flex flex-col gap-0.5 cursor-pointer"
                    onClick={() => {
                      field.onChange(c.id);
                      setSelectedLabel(c.name);
                      setOpen(false);
                    }}
                  >
                    <span className="font-semibold text-foreground text-xs">{c.name}</span>
                    <div className="flex gap-2 text-[10px] text-muted-foreground font-mono uppercase">
                      {c.mobileNo && <span>Mob: {c.mobileNo}</span>}
                      {c.gstin && <span className="text-primary">GST: {c.gstin}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-xs text-destructive pt-1 font-medium">{error}</p>}
          </>
        )}
      />
    </div>
  );
}

/**
 * Isolated Real-Time Item search dropdown selection component
 */
function InlineItemSearchSelector({ control, index, disabled }: { control: any; index: number; disabled: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const matchingItems = await getItems(searchTerm, "active");
        setResults(matchingItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div ref={dropdownRef} className="w-full relative">
      <Controller
        name={`details.${index}.itemId`}
        control={control}
        render={({ field }) => (
          <>
            <input
              type="text"
              disabled={disabled}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-hidden"
              placeholder="🔍 Filter product name or code..."
              value={showDropdown ? searchTerm : selectedLabel || (field.value ? `Item ID: #${field.value}` : "")}
              onFocus={() => {
                setSearchTerm("");
                setShowDropdown(true);
              }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
            />
            {showDropdown && (searchTerm.length > 0 || results.length > 0) && (
              <div className="absolute left-0 right-0 top-9 z-50 max-h-48 overflow-y-auto rounded-md border bg-popover p-1 shadow-md text-xs divide-y">
                {loading && <div className="p-2 text-muted-foreground animate-pulse text-center">Scanning catalog...</div>}
                {!loading && results.length === 0 && <div className="p-2 text-muted-foreground text-center">No active item matches</div>}
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-2 py-1.5 hover:bg-accent flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      field.onChange(item.id);
                      setSelectedLabel(`[${item.itemCode}] ${item.itemDesc}`);
                      setShowDropdown(false);
                    }}
                  >
                    <div>
                      <span className="font-bold font-mono text-primary mr-1 text-[10px] uppercase border px-1 rounded bg-muted">{item.itemCode}</span>
                      <span>{item.itemDesc}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Pack Units: {item.packSize}</span>
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