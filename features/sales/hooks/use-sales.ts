"use client";

import { useState, useEffect, useCallback } from "react";
import type { Sale, SaleMode, PaymentStatus } from "../types/sale";
import { getSales, getSaleById, createSale, updateSalePaymentStatus, cancelSale } from "../api/sale.api";
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

  // Cancellation State Control
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const openCancelConfirm = useCallback((sale: Sale) => {
    setSaleToCancel(sale);
    setIsCancelOpen(true);
  }, []);

  const closeCancelConfirm = useCallback(() => {
    setIsCancelOpen(false);
    setSaleToCancel(null);
  }, []);

  const handleFormSubmit = useCallback(async (values: SaleFormValues) => {
    if (mode === "view") return;

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
  }, [mode, fetchSales, closeDialog]);

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

  const handleCancelSale = useCallback(async () => {
    if (!saleToCancel) return;
    setIsCancelling(true);
    try {
      await cancelSale(saleToCancel.id);
      await fetchSales();
      closeCancelConfirm();
    } catch (err: any) {
      setError(err.message || "Failed to execute sale cancellation rollback.");
    } finally {
      setIsCancelling(false);
    }
  }, [saleToCancel, fetchSales, closeCancelConfirm]);

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

    // Cancellation controls
    isCancelOpen,
    saleToCancel,
    isCancelling,
    openCancelConfirm,
    closeCancelConfirm,
    handleCancelSale,

    refresh: fetchSales,
  };
}