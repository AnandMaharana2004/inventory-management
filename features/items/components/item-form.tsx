"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type ItemFormValues } from "../schemas/item.schema";
import { DEFAULT_ITEM_FORM_VALUES } from "../constants";
import type { Item, ItemMode } from "../types/item";

interface ItemFormProps {
    mode: ItemMode;
    initialData: Item | null;
    isSubmitting: boolean;
    formError: string | null;
    onSubmit: (values: ItemFormValues) => void;
    onCancel: () => void;
}

export function ItemForm({
    mode,
    initialData,
    isSubmitting,
    formError,
    onSubmit,
    onCancel,
}: ItemFormProps) {
    const isViewMode = mode === "view";

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: DEFAULT_ITEM_FORM_VALUES,
    });

    useEffect(() => {
        if (initialData) {
            reset({
                itemCode: initialData.itemCode,
                itemDesc: initialData.itemDesc,
                hsnCode: initialData.hsnCode || "",
                category: initialData.category || "",
                brand: initialData.brand || "",
                packSize: Number(initialData.packSize),
                unitName: initialData.unitName,
                gstPct: Number(initialData.gstPct),
                reorderLevel: Number(initialData.reorderLevel),
            });
        } else {
            reset(DEFAULT_ITEM_FORM_VALUES);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
            {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                    {formError}
                </div>
            )}

            {/* Item Code & Unit Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Unique Item Code *</label>
                    <Controller
                        name="itemCode"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 uppercase font-mono"
                                placeholder="e.g. ITEM-001"
                                {...field}
                            />
                        )}
                    />
                    {errors.itemCode && (
                        <p className="text-xs font-medium text-destructive">{errors.itemCode.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Unit Name (e.g. PCS, KG) *</label>
                    <Controller
                        name="unitName"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="PCS"
                                {...field}
                            />
                        )}
                    />
                    {errors.unitName && (
                        <p className="text-xs font-medium text-destructive">{errors.unitName.message}</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Item Description *</label>
                <Controller
                    name="itemDesc"
                    control={control}
                    render={({ field }) => (
                        <input
                            type="text"
                            disabled={isViewMode || isSubmitting}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detailed description of the stock entity..."
                            {...field}
                        />
                    )}
                />
                {errors.itemDesc && (
                    <p className="text-xs font-medium text-destructive">{errors.itemDesc.message}</p>
                )}
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Brand (Optional)</label>
                    <Controller
                        name="brand"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Logitech"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Category (Optional)</label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Electronics"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Pack Size, GST, Reorder Level, HSN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Pack Size *</label>
                    <Controller
                        name="packSize"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="number"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                                value={field.value ?? ""}
                            />
                        )}
                    />
                    {errors.packSize && (
                        <p className="text-xs font-medium text-destructive">{errors.packSize.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">GST % *</label>
                    <Controller
                        name="gstPct"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="number"
                                step="any"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                                value={field.value ?? ""}
                            />
                        )}
                    />
                    {errors.gstPct && (
                        <p className="text-xs font-medium text-destructive">{errors.gstPct.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Reorder Level *</label>
                    <Controller
                        name="reorderLevel"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="number"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                                value={field.value ?? ""}
                            />
                        )}
                    />
                    {errors.reorderLevel && (
                        <p className="text-xs font-medium text-destructive">{errors.reorderLevel.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">HSN Code</label>
                    <Controller
                        name="hsnCode"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="8471"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent h-9 px-4 py-2 cursor-pointer disabled:opacity-50"
                >
                    {isViewMode ? "Close" : "Cancel"}
                </button>
                {!isViewMode && (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : mode === "create" ? "Add Item" : "Update Item"}
                    </button>
                )}
            </div>
        </form>
    );
}