"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "../schemas/customer.schema";
import { DEFAULT_CUSTOMER_FORM_VALUES } from "../constants";
import type { Customer, CustomerMode } from "../types/customer";

interface CustomerFormProps {
    mode: CustomerMode;
    initialData: Customer | null;
    isSubmitting: boolean;
    formError: string | null;
    onSubmit: (values: CustomerFormValues) => void;
    onCancel: () => void;
}

export function CustomerForm({
    mode,
    initialData,
    isSubmitting,
    formError,
    onSubmit,
    onCancel,
}: CustomerFormProps) {
    const isViewMode = mode === "view";

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: DEFAULT_CUSTOMER_FORM_VALUES,
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                mobileNo: initialData.mobileNo || "",
                gstin: initialData.gstin || "",
                contactPerson: initialData.contactPerson || "",
                address: initialData.address || "",
                city: initialData.city || "",
            });
        } else {
            reset(DEFAULT_CUSTOMER_FORM_VALUES);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
            {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                    {formError}
                </div>
            )}

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Customer Name *</label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <input
                            type="text"
                            disabled={isViewMode || isSubmitting}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. John Doe / Global Retailers"
                            {...field}
                        />
                    )}
                />
                {errors.name && (
                    <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
                )}
            </div>

            {/* Mobile Number and GSTIN row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Mobile Number</label>
                    <Controller
                        name="mobileNo"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. 9876543210"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.mobileNo && (
                        <p className="text-xs font-medium text-destructive">{errors.mobileNo.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">GSTIN Number (Optional)</label>
                    <Controller
                        name="gstin"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 uppercase"
                                placeholder="22AAAAA0000A1Z5"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.gstin && (
                        <p className="text-xs font-medium text-destructive">{errors.gstin.message}</p>
                    )}
                </div>
            </div>

            {/* Contact Person and City row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Contact Representative</label>
                    <Controller
                        name="contactPerson"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Secondary Contact Name"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.contactPerson && (
                        <p className="text-xs font-medium text-destructive">{errors.contactPerson.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">City</label>
                    <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="text"
                                disabled={isViewMode || isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Mumbai"
                                value={field.value || ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.city && (
                        <p className="text-xs font-medium text-destructive">{errors.city.message}</p>
                    )}
                </div>
            </div>

            {/* Full Physical Address */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Street Address</label>
                <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            disabled={isViewMode || isSubmitting}
                            rows={2}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Enter full billing / shipping address..."
                            value={field.value || ""}
                            onChange={field.onChange}
                        />
                    )}
                />
                {errors.address && (
                    <p className="text-xs font-medium text-destructive">{errors.address.message}</p>
                )}
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
                        {isSubmitting ? "Saving..." : mode === "create" ? "Add Customer" : "Update Customer"}
                    </button>
                )}
            </div>
        </form>
    );
}