"use client";

import { useState, useEffect, useCallback } from "react";
import type { Item, ItemMode, ItemStatusFilter } from "../types/item";
import { getItems, createItem, updateItem, deleteItem, activateItem, deactivateItem } from "../api/item.api";
import { type ItemFormValues, formValuesToApi } from "../schemas/item.schema";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ItemStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Modal Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ItemMode>("create");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Alert Confirmation Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data from backend
  const fetchItems = useCallback(async (searchQuery?: string, statusFilter: ItemStatusFilter = "all") => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getItems(searchQuery, statusFilter);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load items catalog.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Server-side debounced search and live filter sync side effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems(search || undefined, status);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, status, fetchItems]);

  // Modal Open Controls
  const openCreate = useCallback(() => {
    setSelectedItem(null);
    setMode("create");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: Item) => {
    setSelectedItem(item);
    setMode("edit");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openView = useCallback((item: Item) => {
    setSelectedItem(item);
    setMode("view");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
    setFormError(null);
  }, []);

  // Delete Actions
  const openDeleteConfirm = useCallback((item: Item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setIsDeleteOpen(false);
    setItemToDelete(null);
  }, []);

  // Status Activation Toggle Controllers
  const handleToggleActivation = useCallback(async (item: Item) => {
    setIsLoading(true);
    try {
      if (item.isActive) {
        await deactivateItem(item.id);
      } else {
        await activateItem(item.id);
      }
      await fetchItems(search || undefined, status);
    } catch (err: any) {
      setError(err.message || "Failed to alter status code state.");
    } finally {
      setIsLoading(false);
    }
  }, [search, status, fetchItems]);

  // Submit Orchestration
  const handleFormSubmit = useCallback(async (values: ItemFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = formValuesToApi(values);
      if (mode === "create") {
        await createItem(payload);
      } else if (mode === "edit" && selectedItem) {
        await updateItem(selectedItem.id, payload);
      }
      await fetchItems(search || undefined, status);
      closeDialog();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred saving item details.");
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, selectedItem, search, status, fetchItems, closeDialog]);

  const handleDeleteItem = useCallback(async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.id);
      await fetchItems(search || undefined, status);
      closeDeleteConfirm();
    } catch (err: any) {
      setError(err.message || "Failed to execute item cleanup processing.");
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, search, status, fetchItems, closeDeleteConfirm]);

  return {
    items,
    search,
    setSearch,
    status,
    setStatus,
    isLoading,
    error,

    // Form Modal Data Map
    isOpen,
    mode,
    selectedItem,
    openCreate,
    openEdit,
    openView,
    closeDialog,
    isSubmitting,
    formError,
    handleFormSubmit,

    // Status Activation Actions
    handleToggleActivation,

    // Delete Modals
    isDeleteOpen,
    itemToDelete,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteItem,
    refresh: () => fetchItems(search || undefined, status),
  };
}