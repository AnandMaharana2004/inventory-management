"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Discount, DiscountFilter, DiscountMode } from "../types/discount";
import { getDiscounts, createDiscount } from "../api/discount.api";
import { formValuesToApi, type DiscountFormValues } from "../schemas/discount.schema";

export function useDiscounts() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [filter, setFilter] = useState<DiscountFilter>("current");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dialog state management
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<DiscountMode>("create");
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

    // Form handling state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchDiscounts = useCallback(async (currentFilter: DiscountFilter) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getDiscounts(currentFilter);
            setDiscounts(data);
        } catch (err: any) {
            setError(err.message || "Failed to load discount records.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch whenever filter changes
    useEffect(() => {
        fetchDiscounts(filter);
    }, [filter, fetchDiscounts]);

    // Handle front-end search over the list using description fields
    const filteredDiscounts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return discounts;

        return discounts.filter((d) => {
            const offerCode = d.onItem?.itemCode?.toLowerCase() || "";
            const offerDesc = d.onItem?.itemDesc?.toLowerCase() || "";
            const baseCode = d.discountedItem?.itemCode?.toLowerCase() || "";
            const baseDesc = d.discountedItem?.itemDesc?.toLowerCase() || "";

            return (
                offerCode.includes(query) ||
                offerDesc.includes(query) ||
                baseCode.includes(query) ||
                baseDesc.includes(query)
            );
        });
    }, [search, discounts]);

    // Dialog triggers
    const openCreate = useCallback(() => {
        setSelectedDiscount(null);
        setMode("create");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const openView = useCallback((discount: Discount) => {
        setSelectedDiscount(discount);
        setMode("view");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        setSelectedDiscount(null);
        setFormError(null);
    }, []);

    // Form submission coordinator
    const handleCreateDiscount = useCallback(async (values: DiscountFormValues) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            const payload = formValuesToApi(values);
            await createDiscount(payload);
            await fetchDiscounts(filter); // Refresh collection state
            closeDialog();
        } catch (err: any) {
            setFormError(err.message || "An error occurred while creating the discount.");
        } finally {
            setIsSubmitting(false);
        }
    }, [filter, fetchDiscounts, closeDialog]);

    return {
        discounts: filteredDiscounts,
        filter,
        setFilter,
        search,
        setSearch,
        isLoading,
        error,

        // Modal states
        isOpen,
        mode,
        selectedDiscount,
        openCreate,
        openView,
        closeDialog,

        // Form execution
        isSubmitting,
        formError,
        handleCreateDiscount,
        refresh: () => fetchDiscounts(filter),
    };
}