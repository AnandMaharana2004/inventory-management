"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseSchema, type PurchaseFormValues } from "../schemas/purchase.schema";
import { DEFAULT_PURCHASE_FORM_VALUES, DEFAULT_PURCHASE_LINE_VALUES, RATE_BASIS_OPTIONS } from "../constants";
import type { Purchase, PurchaseMode } from "../types/purchase";
import { getItems } from "../../items/api/item.api";
import { getVendors } from "../../vendors/api/vendor.api";
import type { Item } from "../../items/types/item";
import type { Vendor } from "../../vendors/types/vendor";

interface PurchaseFormProps {
    mode: PurchaseMode;
    initialData: Purchase | null;
    isSubmitting: boolean;
    formError: string | null;
    onSubmit: (values: PurchaseFormValues) => void;
    onCancel: () => void;
}

export function PurchaseForm({
    mode,
    initialData,
    isSubmitting,
    formError,
    onSubmit,
    onCancel,
}: PurchaseFormProps) {
    const isViewMode = mode === "view";

    const [viewItemDetails, setViewItemDetails] = useState<Record<number, string>>({});
    const [initialVendorLabel, setInitialVendorLabel] = useState("");

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: DEFAULT_PURCHASE_FORM_VALUES,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "details",
    });

    useEffect(() => {
        if (isViewMode && initialData) {
            const formattedLines = initialData.details?.map((d) => ({
                itemId: d.itemId,
                packQty: d.packQty,
                looseQty: d.looseQty,
                purchaseRate: Number(d.purchaseRate),
                discountPct: Number(d.discountPct),
                rateBasis: d.rateBasis,
            })) || [];

            reset({
                poDate: new Date(initialData.poDate).toISOString().split("T")[0],
                invoiceNumber: initialData.invoiceNumber || "",
                vendorId: initialData.vendorId,
                details: formattedLines,
            });

            if (initialData.vendor) {
                setInitialVendorLabel(initialData.vendor.name);
            }

            initialData.details?.forEach((line) => {
                if (line.itemId && line.item) {
                    setViewItemDetails(prev => ({
                        ...prev,
                        [line.itemId]: `[${line?.item?.itemCode}] ${line?.item?.itemDesc}`
                    }));
                }
            });
        } else {
            reset(DEFAULT_PURCHASE_FORM_VALUES);
            setInitialVendorLabel("");
        }
    }, [initialData, isViewMode, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-1">
            {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                    {formError}
                </div>
            )}

            {/* Header Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Processing Date */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">PO Processing Date *</label>
                    <Controller
                        name="poDate"
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
                    {errors.poDate && (
                        <p className="text-xs font-medium text-destructive">{errors.poDate.message}</p>
                    )}
                </div>

                {/* Real-time Debounced Vendor Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Merchant Vendor Supplier *</label>
                    {isViewMode ? (
                        <input
                            type="text"
                            disabled
                            className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-xs"
                            value={initialVendorLabel || `Vendor ID: #${initialData?.vendorId}`}
                        />
                    ) : (
                        <HeaderVendorSearchSelector
                            control={control}
                            disabled={isSubmitting}
                            error={errors.vendorId?.message}
                        />
                    )}
                </div>

                {/* Invoice Reference Number */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Invoice Reference Number</label>
                    <Controller
                        name="invoiceNumber"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden font-mono"
                                placeholder="e.g. INV-9982"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Transaction Lines Matrix Section */}
            <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Line Items Itemized List</h4>
                    {!isViewMode && (
                        <button
                            type="button"
                            onClick={() => append({ ...DEFAULT_PURCHASE_LINE_VALUES })}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-3 hover:bg-accent cursor-pointer"
                        >
                            + Append Line Item
                        </button>
                    )}
                </div>

                {errors.details && (
                    <p className="text-xs font-medium text-destructive">{errors.details.root?.message || errors.details.message}</p>
                )}

                {/* Slidable Horizontal Data Container Row */}
                <div className="w-full overflow-x-auto border border-border rounded-lg bg-muted/5 max-h-[50vh] overflow-y-auto">
                    <div className="min-w-[1050px] p-4 space-y-3">
                        {/* Header Description Labels */}
                        <div className="grid grid-cols-12 gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 border-b border-border/40 pb-2">
                            <div className="col-span-4">Item Catalog Quick Lookup & Selection</div>
                            <div className="col-span-2">Rate Valuation Basis</div>
                            <div className="col-span-1.5">Pack Qty</div>
                            <div className="col-span-1.5">Loose Qty</div>
                            <div className="col-span-1.5">Purchase Rate</div>
                            <div className="col-span-1">Disc %</div>
                            <div className="col-span-0.5 text-right"></div>
                        </div>

                        {fields.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-2 rounded-md hover:bg-muted/30 transition-colors">

                                {/* Item Search Input */}
                                <div className="col-span-4 relative">
                                    {isViewMode ? (
                                        <input
                                            type="text"
                                            disabled
                                            className="flex h-8 w-full rounded-md border border-input bg-muted/50 px-2 py-1 text-xs font-medium"
                                            value={viewItemDetails[item.itemId] || `Item ID: #${item.itemId}`}
                                        />
                                    ) : (
                                        <InlineItemSearchSelector
                                            control={control}
                                            index={index}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                </div>

                                {/* Rate Basis dropdown */}
                                <div className="col-span-2">
                                    <Controller
                                        name={`details.${index}.rateBasis`}
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                disabled={isViewMode || isSubmitting}
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                                                {...field}
                                            >
                                                {RATE_BASIS_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>

                                {/* Pack Qty */}
                                <div className="col-span-1.5">
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
                                <div className="col-span-1.5">
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

                                {/* Purchase Rate */}
                                <div className="col-span-1.5">
                                    <Controller
                                        name={`details.${index}.purchaseRate`}
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

                                {/* Discount Percentage */}
                                <div className="col-span-1">
                                    <Controller
                                        name={`details.${index}.discountPct`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="number"
                                                step="any"
                                                disabled={isViewMode || isSubmitting}
                                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs text-center shadow-xs"
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                                value={field.value ?? 0}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Remove Line Action */}
                                <div className="col-span-0.5 text-right">
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

            {/* Numerical Ledger Calculation Board Summary */}
            {isViewMode && initialData && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-muted/40 border border-border rounded-lg text-sm">
                    <div><span className="text-xs block text-muted-foreground uppercase">Total Base Amt</span><span className="font-bold font-mono">₹{Number(initialData.totalAmount).toFixed(2)}</span></div>
                    <div><span className="text-xs block text-muted-foreground uppercase">Total Discount</span><span className="font-bold font-mono text-destructive">₹{Number(initialData.discountAmount).toFixed(2)}</span></div>
                    <div><span className="text-xs block text-muted-foreground uppercase">CGST Tax Pool</span><span className="font-bold font-mono">₹{Number(initialData.cgstAmount).toFixed(2)}</span></div>
                    <div><span className="text-xs block text-muted-foreground uppercase">SGST Tax Pool</span><span className="font-bold font-mono">₹{Number(initialData.sgstAmount).toFixed(2)}</span></div>
                    <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-border pt-2 md:pt-0 md:pl-3"><span className="text-xs block text-muted-foreground uppercase font-semibold">Net Transaction Sum</span><span className="font-extrabold font-mono text-emerald-600 text-base">₹{Number(initialData.netAmount).toFixed(2)}</span></div>
                </div>
            )}

            {/* Action triggers layout line footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent h-9 px-4 py-2 cursor-pointer"
                >
                    {isViewMode ? "Close View" : "Cancel"}
                </button>
                {!isViewMode && (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
                    >
                        {isSubmitting ? "Committing Ledger Entries..." : "Post Purchase Influx"}
                    </button>
                )}
            </div>
        </form>
    );
}

/**
 * Real-Time Debounced Vendor Selector Sub-Component
 */
function HeaderVendorSearchSelector({ control, disabled, error }: { control: any; disabled: boolean; error?: string }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState("");
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShowOverlay(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setVendors([]);
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                const matchingVendors = await getVendors(searchTerm);
                setVendors(matchingVendors);
            } catch (err) {
                console.error("Vendor fetch failure:", err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    return (
        <div ref={popoverRef} className="w-full relative">
            <Controller
                name="vendorId"
                control={control}
                render={({ field }) => (
                    <>
                        <input
                            type="text"
                            disabled={disabled}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus:outline-hidden"
                            placeholder="🔍 Search vendor title or registry name..."
                            value={showOverlay ? searchTerm : selectedName || (field.value ? `Vendor selected: #${field.value}` : "")}
                            onFocus={() => {
                                setSearchTerm("");
                                setShowOverlay(true);
                            }}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowOverlay(true);
                            }}
                        />
                        {showOverlay && (searchTerm.length > 0 || vendors.length > 0) && (
                            <div className="absolute left-0 right-0 top-10 z-50 max-h-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md text-foreground text-xs font-medium divide-y divide-border/40">
                                {loading && (
                                    <div className="p-2 text-muted-foreground animate-pulse text-center">Querying supplier index...</div>
                                )}
                                {!loading && vendors.length === 0 && (
                                    <div className="p-2 text-muted-foreground text-center">No vendors discovered matching profile keywords</div>
                                )}
                                {vendors.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex flex-col gap-0.5 cursor-pointer"
                                        onClick={() => {
                                            field.onChange(v.id);
                                            setSelectedName(v.name);
                                            setShowOverlay(false);
                                        }}
                                    >
                                        <span className="font-semibold text-foreground text-xs">{v.name}</span>
                                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                                            {v.gstin && <span className="font-mono text-primary uppercase">GST: {v.gstin}</span>}
                                            {v.contactPerson && <span>• Attn: {v.contactPerson}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {error && <p className="text-xs font-medium text-destructive pt-1">{error}</p>}
                    </>
                )}
            />
        </div>
    );
}

/**
 * Isolated Sub-Component for Universal Real-Time Item Search Popover selection
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
                console.error("Item search failure:", err);
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
                            className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus:outline-hidden"
                            placeholder="🔍 Search item description or code..."
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
                            <div className="absolute left-0 right-0 top-9 z-50 max-h-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md text-foreground text-xs font-medium divide-y divide-border/40">
                                {loading && (
                                    <div className="p-2 text-muted-foreground animate-pulse text-center">Searching master catalog...</div>
                                )}
                                {!loading && results.length === 0 && (
                                    <div className="p-2 text-muted-foreground text-center">No active matches found</div>
                                )}
                                {results.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="w-full text-left px-2 py-1.5 hover:bg-accent transition-colors flex justify-between items-center cursor-pointer"
                                        onClick={() => {
                                            field.onChange(item.id);
                                            setSelectedLabel(`[${item.itemCode}] ${item.itemDesc}`);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <div>
                                            <span className="font-bold font-mono text-primary mr-1 text-[11px] uppercase border px-1 rounded bg-muted/40">{item.itemCode}</span>
                                            <span>{item.itemDesc}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">Pack: {item.packSize}</span>
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