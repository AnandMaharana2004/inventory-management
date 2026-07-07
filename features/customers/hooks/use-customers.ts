"use client"

import { useState, useEffect, useCallback } from "react";
import type { Customer, CustomerMode } from "../types/customer";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../api/customer.api";
import { type CustomerFormValues, formValuesToApi } from "../schemas/customer.schema";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Modal Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CustomerMode>("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Alert Confirmation Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch and sync data
  const fetchCustomers = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomers(searchQuery);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Server-side debounced search side effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search || undefined);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  // Modal Open Controls
  const openCreate = useCallback(() => {
    setSelectedCustomer(null);
    setMode("create");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setMode("edit");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const openView = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setMode("view");
    setFormError(null);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedCustomer(null);
    setFormError(null);
  }, []);

  // Delete Actions
  const openDeleteConfirm = useCallback((customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setIsDeleteOpen(false);
    setCustomerToDelete(null);
  }, []);

  // Submit Orchestration
  const handleFormSubmit = useCallback(async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = formValuesToApi(values);
      if (mode === "create") {
        await createCustomer(payload);
      } else if (mode === "edit" && selectedCustomer) {
        await updateCustomer(selectedCustomer.id, payload);
      }
      await fetchCustomers(search || undefined);
      closeDialog();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred saving customer record.");
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, selectedCustomer, search, fetchCustomers, closeDialog]);

  const handleDeleteCustomer = useCallback(async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      await fetchCustomers(search || undefined);
      closeDeleteConfirm();
    } catch (err: any) {
      setError(err.message || "Failed to execute customer removal processing.");
    } finally {
      setIsDeleting(false);
    }
  }, [customerToDelete, search, fetchCustomers, closeDeleteConfirm]);

  return {
    customers,
    search,
    setSearch,
    isLoading,
    error,

    // Form Modal Data Map
    isOpen,
    mode,
    selectedCustomer,
    openCreate,
    openEdit,
    openView,
    closeDialog,
    isSubmitting,
    formError,
    handleFormSubmit,

    // Delete Modals
    isDeleteOpen,
    customerToDelete,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteCustomer,
    refresh: () => fetchCustomers(search || undefined),
  };
}