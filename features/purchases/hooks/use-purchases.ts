"use client";

import { useState, useEffect, useCallback } from "react";
import type { Purchase, PurchaseMode } from "../types/purchase";
import { getPurchases, getPurchaseById, createPurchase } from "../api/purchase.api";
import { type PurchaseFormValues, formValuesToApi } from "../schemas/purchase.schema";

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter conditions
  const [vendorIdFilter, setVendorIdFilter] = useState<number | undefined>(undefined);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Dialog overlay controller map
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PurchaseMode>("create");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: { vendorId?: number; startDate?: string; endDate?: string } = {};
      if (vendorIdFilter) filters.vendorId = vendorIdFilter;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;

      const data = await getPurchases(filters);
      setPurchases(data);
    } catch (err: any) {
      setError(err.message || "Failed to load purchases history ledger.");
    } finally {
      setIsLoading(false);
    }
  }, [vendorIdFilter, startDateFilter, endDateFilter]);

  // Sync index array data on parameter modifications
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const openCreate = useCallback(() => {
    setSelectedPurchase(null);
    setMode("create");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openView = useCallback(async (purchaseId: number) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const fullDoc = await getPurchaseById(purchaseId);
      setSelectedPurchase(fullDoc);
      setMode("view");
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to isolate historical transaction files.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedPurchase(null);
    setFormError(null);
  }, []);

  const handleFormSubmit = useCallback(async (values: PurchaseFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = formValuesToApi(values);
      await createPurchase(payload);
      await fetchPurchases();
      closeDialog();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error blocked purchase orchestration processing.");
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchPurchases, closeDialog]);

  return {
    purchases,
    isLoading,
    error,

    // Filter controls
    vendorIdFilter,
    setVendorIdFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,

    // Modals
    isOpen,
    mode,
    selectedPurchase,
    openCreate,
    openView,
    closeDialog,
    isSubmitting,
    formError,
    handleFormSubmit,
    refresh: fetchPurchases,
  };
}