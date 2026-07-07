"use client";

import React from "react";
import { useDiscounts } from "../hooks/use-discounts";
import { DiscountForm } from "./discount-form";
import { DISCOUNT_FILTERS } from "../constants";
import type { DiscountFilter } from "../types/discount";

export function DiscountList() {
    const {
        discounts,
        filter,
        setFilter,
        search,
        setSearch,
        isLoading,
        error,
        isOpen,
        mode,
        selectedDiscount,
        openCreate,
        openView,
        closeDialog,
        isSubmitting,
        formError,
        handleCreateDiscount,
    } = useDiscounts();

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Discount Schemes</h1>
                    <p className="text-sm text-muted-foreground">Manage cascading or localized promotional pricing combinations.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
                >
                    New Rule Contract
                </button>
            </div>

            {/* Query Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by code or descriptor keywords..."
                    className="flex h-9 w-full sm:w-80 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={filter}
                    className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
                    onChange={(e) => setFilter(e.target.value as DiscountFilter)}
                >
                    {DISCOUNT_FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            {/* Main Presentation Surface */}
            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
                    Syncing configuration tables...
                </div>
            ) : discounts.length === 0 ? (
                <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
                    <p className="text-sm font-medium text-muted-foreground">No active discounts or schemas discovered.</p>
                </div>
            ) : (
                <div className="relative w-full overflow-auto rounded-lg border border-border">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-10 px-4 text-left align-middle font-medium">Scheme ID</th>
                                <th className="h-10 px-4 text-left align-middle font-medium">On Item</th>
                                <th className="h-10 px-4 text-left align-middle font-medium">Rule (Buy Condition)</th>
                                <th className="h-10 px-4 text-left align-middle font-medium">Discounted Item</th>
                                <th className="h-10 px-4 text-left align-middle font-medium">Benefit</th>
                                <th className="h-10 px-4 text-left align-middle font-medium">Valid Horizon</th>
                                <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {discounts.map((discount) => (
                                <tr key={discount.id} className="transition-colors hover:bg-muted/30">
                                    <td className="p-4 align-middle font-medium">#{discount.id}</td>
                                    <td className="p-4 align-middle">
                                        <div className="font-medium text-foreground">ID: {discount.onItemId}</div>
                                        {discount.onItem && (
                                            <div className="text-xs text-muted-foreground">
                                                [{discount.onItem.itemCode}] {discount.onItem.itemDesc}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle whitespace-nowrap">
                                        <span className="font-semibold">{Number(discount.attributeQty)}</span> - {discount.perAttribute}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="font-medium text-foreground">ID: {discount.discountedItemId}</div>
                                        {discount.discountedItem && (
                                            <div className="text-xs text-muted-foreground">
                                                [{discount.discountedItem.itemCode}] {discount.discountedItem.itemDesc}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle whitespace-nowrap text-emerald-600 font-medium">
                                        {Number(discount.discountedQty)} ({discount.discountedAttribute})
                                    </td>
                                    <td className="p-4 align-middle text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(discount.startDate).toLocaleDateString()} to {new Date(discount.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <button
                                            onClick={() => openView(discount)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-3 hover:bg-accent cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Unified Modality Dialog Frame overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-background border border-border w-full max-w-2xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {mode === "create" ? "Configure New Promotional Scheme" : `View Discount Setup Contract #${selectedDiscount?.id}`}
                            </h3>
                            <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
                        </div>
                        <DiscountForm
                            mode={mode}
                            initialData={selectedDiscount}
                            isSubmitting={isSubmitting}
                            formError={formError}
                            onSubmit={handleCreateDiscount}
                            onCancel={closeDialog}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}