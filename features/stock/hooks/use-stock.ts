"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockRecord, StockMode } from "../types/stock";
import { getStocks, createOpeningStock, adjustStock } from "../api/stock.api";
import { type OpeningStockFormValues, type AdjustStockFormValues, openingFormToApi, adjustFormToApi } from "../schemas/stock.schema";

export function useStock() {
  const [stocks, setStocks] = useState<StockRecord[]>([]);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unified Dialog State Control
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<StockMode>("view");
  const [selectedStock, setSelectedStock] = useState<StockRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStocks = useCallback(async (lowStockOnly: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStocks(lowStockOnly);
      setStocks(data);
    } catch (err: any) {
      setError(err.message || "Failed to synchronize current stock parameters.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks(lowStockFilter);
  }, [lowStockFilter, fetchStocks]);

  const openOpeningModal = useCallback(() => {
    setSelectedStock(null);
    setMode("opening");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openAdjustModal = useCallback((stock?: StockRecord) => {
    if (stock) {
      setSelectedStock(stock);
    } else {
      setSelectedStock(null);
    }
    setMode("adjust");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openViewModal = useCallback((stock: StockRecord) => {
    setSelectedStock(stock);
    setMode("view");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedStock(null);
    setFormError(null);
  }, []);

  const handleOpeningSubmit = useCallback(async (values: OpeningStockFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = openingFormToApi(values);
      await createOpeningStock(payload);
      await fetchStocks(lowStockFilter);
      closeDialog();
    } catch (err: any) {
      setFormError(err.message || "Failed to commit opening balances pipeline.");
    } finally {
      setIsSubmitting(false);
    }
  }, [lowStockFilter, fetchStocks, closeDialog]);

  const handleAdjustSubmit = useCallback(async (values: AdjustStockFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = adjustFormToApi(values);
      await adjustStock(payload);
      await fetchStocks(lowStockFilter);
      closeDialog();
    } catch (err: any) {
      setFormError(err.message || "Failed to record manual correction log entries.");
    } finally {
      setIsSubmitting(false);
    }
  }, [lowStockFilter, fetchStocks, closeDialog]);

  // Client-side text filter over computed collection
  const filteredStocks = stocks.filter(s => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      s.item.itemCode.toLowerCase().includes(term) ||
      s.item.itemDesc.toLowerCase().includes(term) ||
      s.item.brand?.toLowerCase().includes(term) ||
      s.item.category?.toLowerCase().includes(term)
    );
  });

  return {
    stocks: filteredStocks,
    lowStockFilter,
    setLowStockFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,

    isOpen,
    mode,
    selectedStock,
    openOpeningModal,
    openAdjustModal,
    openViewModal,
    closeDialog,
    isSubmitting,
    formError,
    handleOpeningSubmit,
    handleAdjustSubmit,
    refresh: () => fetchStocks(lowStockFilter),
  };
}