"use client";

import { useState, useEffect, useCallback } from "react";
import type { Sale, SaleMode, PaymentStatus } from "../types/sale";
import { getSales, getSaleById, createSale, updateSalePaymentStatus } from "../api/sale.api";
import { type SaleFormValues, formValuesToApi } from "../schemas/sale.schema";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-dimensional lookup filter fields
  const [customerIdFilter, setCustomerIdFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Dialog State Control
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SaleMode>("create");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: { customerId?: number; paymentStatus?: PaymentStatus; startDate?: string; endDate?: string } = {};
      if (customerIdFilter) filters.customerId = customerIdFilter;
      if (statusFilter !== "ALL") filters.paymentStatus = statusFilter;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;

      const data = await getSales(filters);
      setSales(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sales database registers.");
    } finally {
      setIsLoading(false);
    }
  }, [customerIdFilter, statusFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const openCreate = useCallback(() => {
    setSelectedSale(null);
    setMode("create");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openView = useCallback(async (saleId: number) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const fullDoc = await getSaleById(saleId);
      setSelectedSale(fullDoc);
      setMode("view");
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to isolate historical billing file details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedSale(null);
    setFormError(null);
  }, []);

  const handleFormSubmit = useCallback(async (values: SaleFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = formValuesToApi(values);
      await createSale(payload);
      await fetchSales();
      closeDialog();
    } catch (err: any) {
      setFormError(err.message || "Stock insufficiency or transaction constraint collision blocked billing processing.");
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchSales, closeDialog]);

  const handleUpdateStatus = useCallback(async (saleId: number, nextStatus: PaymentStatus) => {
    try {
      await updateSalePaymentStatus(saleId, nextStatus);
      await fetchSales();
      if (selectedSale?.id === saleId) {
        const structuralRefresh = await getSaleById(saleId);
        setSelectedSale(structuralRefresh);
      }
    } catch (err: any) {
      alert(err.message || "Failed to alter payment status permissions.");
    }
  }, [fetchSales, selectedSale]);

  return {
    sales,
    isLoading,
    error,

    // Filter controls
    customerIdFilter,
    setCustomerIdFilter,
    statusFilter,
    setStatusFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,

    // Dialog state parameters
    isOpen,
    mode,
    selectedSale,
    openCreate,
    openView,
    closeDialog,
    isSubmitting,
    formError,
    handleFormSubmit,
    handleUpdateStatus,
    refresh: fetchSales,
  };
}