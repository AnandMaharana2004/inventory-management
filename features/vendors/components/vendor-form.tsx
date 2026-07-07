"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, type VendorFormValues } from "../schemas/vendor.schema";
import { DEFAULT_VENDOR_FORM_VALUES } from "../constants";
import type { Vendor, VendorMode } from "../types/vendor";

interface VendorFormProps {
  mode: VendorMode;
  initialData: Vendor | null;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: (values: VendorFormValues) => void;
  onCancel: () => void;
}

export function VendorForm({
  mode,
  initialData,
  isSubmitting,
  formError,
  onSubmit,
  onCancel,
}: VendorFormProps) {
  const isViewMode = mode === "view";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: DEFAULT_VENDOR_FORM_VALUES,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        gstin: initialData.gstin || "",
        location: initialData.location || "",
        contactPerson: initialData.contactPerson || "",
        contactNumber: initialData.contactNumber || "",
        email: initialData.email || "",
      });
    } else {
      reset(DEFAULT_VENDOR_FORM_VALUES);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      {formError && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
          {formError}
        </div>
      )}

      {/* Vendor Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Vendor Corporate Name *</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              disabled={isViewMode || isSubmitting}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Acme Industrial Supplies"
              {...field}
            />
          )}
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* GSTIN and Email row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                type="email"
                disabled={isViewMode || isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="billing@vendor.com"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
          {errors.email && (
            <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Contact Metadata row */}
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
                placeholder="John Doe"
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
          <label className="text-sm font-medium text-foreground">Contact Phone Number</label>
          <Controller
            name="contactNumber"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                disabled={isViewMode || isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="+1 (555) 000-0000"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
          {errors.contactNumber && (
            <p className="text-xs font-medium text-destructive">{errors.contactNumber.message}</p>
          )}
        </div>
      </div>

      {/* Location Physical Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Operational Location Address</label>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <textarea
              disabled={isViewMode || isSubmitting}
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Warehouse address details..."
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />
        {errors.location && (
          <p className="text-xs font-medium text-destructive">{errors.location.message}</p>
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
            {isSubmitting ? "Saving changes..." : mode === "create" ? "Add Vendor" : "Update Vendor"}
          </button>
        )}
      </div>
    </form>
  );
}