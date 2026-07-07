"use client"
import { useState, useEffect, useCallback } from "react";
import type { Vendor, VendorMode } from "../types/vendor";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../api/vendor.api";
import { type VendorFormValues, formValuesToApi } from "../schemas/vendor.schema";

export function useVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Modal Dialog State
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<VendorMode>("create");
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete Alert Confirmation Dialog State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load and search handlers
    const fetchVendors = useCallback(async (searchQuery?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getVendors(searchQuery);
            setVendors(data);
        } catch (err: any) {
            setError(err.message || "Failed to load vendors.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Server-side debounced search side effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors(search || undefined);
        }, 350);

        return () => clearTimeout(timer);
    }, [search, fetchVendors]);

    // Modal Open Controls
    const openCreate = useCallback(() => {
        setSelectedVendor(null);
        setMode("create");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((vendor: Vendor) => {
        setSelectedVendor(vendor);
        setMode("edit");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const openView = useCallback((vendor: Vendor) => {
        setSelectedVendor(vendor);
        setMode("view");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        setSelectedVendor(null);
        setFormError(null);
    }, []);

    // Delete Actions
    const openDeleteConfirm = useCallback((vendor: Vendor) => {
        setVendorToDelete(vendor);
        setIsDeleteOpen(true);
    }, []);

    const closeDeleteConfirm = useCallback(() => {
        setIsDeleteOpen(false);
        setVendorToDelete(null);
    }, []);

    // Submit Orchestration
    const handleFormSubmit = useCallback(async (values: VendorFormValues) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            const payload = formValuesToApi(values);
            if (mode === "create") {
                await createVendor(payload);
            } else if (mode === "edit" && selectedVendor) {
                await updateVendor(selectedVendor.id, payload);
            }
            await fetchVendors(search || undefined);
            closeDialog();
        } catch (err: any) {
            setFormError(err.message || "An unexpected error occurred saving vendor record.");
        } finally {
            setIsSubmitting(false);
        }
    }, [mode, selectedVendor, search, fetchVendors, closeDialog]);

    const handleDeleteVendor = useCallback(async () => {
        if (!vendorToDelete) return;
        setIsDeleting(true);
        try {
            await deleteVendor(vendorToDelete.id);
            await fetchVendors(search || undefined);
            closeDeleteConfirm();
        } catch (err: any) {
            setError(err.message || "Failed to execute vendor removal processing.");
        } finally {
            setIsDeleting(false);
        }
    }, [vendorToDelete, search, fetchVendors, closeDeleteConfirm]);

    return {
        vendors,
        search,
        setSearch,
        isLoading,
        error,

        // Form Modal Data Map
        isOpen,
        mode,
        selectedVendor,
        openCreate,
        openEdit,
        openView,
        closeDialog,
        isSubmitting,
        formError,
        handleFormSubmit,

        // Delete Modals
        isDeleteOpen,
        vendorToDelete,
        isDeleting,
        openDeleteConfirm,
        closeDeleteConfirm,
        handleDeleteVendor,
        refresh: () => fetchVendors(search || undefined),
    };
}