"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discountSchema, type DiscountFormValues } from "../schemas/discount.schema";
import { ATTRIBUTE_OPTIONS, DEFAULT_FORM_VALUES } from "../constants";
import type { Discount, DiscountMode } from "../types/discount";

// Using pure HTML select element styling compatible with shadcn layout design primitives
interface DiscountFormProps {
    mode: DiscountMode;
    initialData: Discount | null;
    isSubmitting: boolean;
    formError: string | null;
    onSubmit: (values: DiscountFormValues) => void;
    onCancel: () => void;
}

export function DiscountForm({
    mode,
    initialData,
    isSubmitting,
    formError,
    onSubmit,
    onCancel,
}: DiscountFormProps) {
    const isViewMode = mode === "view";

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DiscountFormValues>({
        resolver: zodResolver(discountSchema),
        defaultValues: DEFAULT_FORM_VALUES,
    });

    // Populate data when opening in view mode
    useEffect(() => {
        if (initialData) {
            reset({
                onItemId: initialData.onItemId,
                discountedItemId: initialData.discountedItemId,
                perAttribute: initialData.perAttribute,
                attributeQty: Number(initialData.attributeQty),
                discountedAttribute: initialData.discountedAttribute,
                discountedQty: Number(initialData.discountedQty),
                startDate: new Date(initialData.startDate).toISOString().split("T")[0],
                endDate: new Date(initialData.endDate).toISOString().split("T")[0],
            });
        } else {
            reset(DEFAULT_FORM_VALUES);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                    {formError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Offer Item Selection */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Offer Item ID</label>
                    <Controller
                        name="onItemId"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="number"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                placeholder="Enter Offer Item ID"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                value={field.value ?? ""}
                            />
                        )}
                    />
                    {errors.onItemId && (
                        <p className="text-xs font-medium text-destructive">{errors.onItemId.message}</p>
                    )}
                </div>

                {/* Discounted Item Selection */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Discounted Item ID</label>
                    <Controller
                        name="discountedItemId"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="number"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                placeholder="Enter Discounted Item ID"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                value={field.value ?? ""}
                            />
                        )}
                    />
                    {errors.discountedItemId && (
                        <p className="text-xs font-medium text-destructive">{errors.discountedItemId.message}</p>
                    )}
                </div>
            </div>

            <div className="border border-border/60 p-4 rounded-lg bg-muted/20 space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trigger Rule Condition</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Per Attribute</label>
                        <Controller
                            name="perAttribute"
                            control={control}
                            render={({ field }) => (
                                <select
                                    disabled={isViewMode || isSubmitting}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                    {...field}
                                >
                                    {ATTRIBUTE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Trigger Quantity</label>
                        <Controller
                            name="attributeQty"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    step="any"
                                    disabled={isViewMode || isSubmitting}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                    value={field.value || ""}
                                />
                            )}
                        />
                        {errors.attributeQty && (
                            <p className="text-xs font-medium text-destructive">{errors.attributeQty.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="border border-border/60 p-4 rounded-lg bg-muted/20 space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Benefit Rewarded</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Discounted Attribute</label>
                        <Controller
                            name="discountedAttribute"
                            control={control}
                            render={({ field }) => (
                                <select
                                    disabled={isViewMode || isSubmitting}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                    {...field}
                                >
                                    {ATTRIBUTE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Discounted Reward Value</label>
                        <Controller
                            name="discountedQty"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    step="any"
                                    disabled={isViewMode || isSubmitting}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                    value={field.value || ""}
                                />
                            )}
                        />
                        {errors.discountedQty && (
                            <p className="text-xs font-medium text-destructive">{errors.discountedQty.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Start Validity Date</label>
                    <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="date"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                {...field}
                            />
                        )}
                    />
                    {errors.startDate && (
                        <p className="text-xs font-medium text-destructive">{errors.startDate.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">End Validity Date</label>
                    <Controller
                        name="endDate"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="date"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                {...field}
                            />
                        )}
                    />
                    {errors.endDate && (
                        <p className="text-xs font-medium text-destructive">{errors.endDate.message}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer disabled:opacity-50"
                >
                    {isViewMode ? "Close" : "Cancel"}
                </button>
                {!isViewMode && (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating..." : "Save Discount"}
                    </button>
                )}
            </div>
        </form>
    );
}