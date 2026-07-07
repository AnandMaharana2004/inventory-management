"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserFormValues } from "../schemas/user.schema";
import { DEFAULT_USER_FORM_VALUES, USER_ROLE_OPTIONS } from "../constants";
import type { User, UserMode } from "../types/user";

interface UserFormProps {
  mode: UserMode;
  initialData: User | null;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
}

export function UserForm({
  mode,
  initialData,
  isSubmitting,
  formError,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: DEFAULT_USER_FORM_VALUES,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email || "",
        role: initialData.role,
        contactNumber: initialData.contactNumber || "",
        password: "", // Kept blank on update phases
      });
    } else {
      reset(DEFAULT_USER_FORM_VALUES);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      {formError && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
          {formError}
        </div>
      )}

      {/* User Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Full Employee Name *</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              disabled={isViewMode || isSubmitting}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Anand Maharana"
              {...field}
            />
          )}
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Role and Contact Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Access Privilege Role *</label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <select
                disabled={isViewMode || isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                {...field}
              >
                {USER_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          />
          {errors.role && (
            <p className="text-xs font-medium text-destructive">{errors.role.message}</p>
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
                placeholder="e.g. +91 9876543210"
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

      {/* Email and Password fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Login Email Address</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                type="email"
                disabled={isViewMode || isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="anand@company.com"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
          {errors.email && (
            <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>

        {isCreateMode && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Account Access Password *</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  type="password"
                  disabled={isSubmitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Min 6 characters"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions Row */}
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
            {isSubmitting ? "Processing..." : isCreateMode ? "Provision User" : "Update Permissions"}
          </button>
        )}
      </div>
    </form>
  );
}