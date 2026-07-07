"use client";

import React from "react";
import { useItems } from "../hooks/use-items";
import { ItemForm } from "./item-form";
import { ITEM_STATUS_FILTERS } from "../constants";
import type { ItemStatusFilter } from "../types/item";

export function ItemList() {
    const {
        items,
        search,
        setSearch,
        status,
        setStatus,
        isLoading,
        error,
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
        handleToggleActivation,
        isDeleteOpen,
        itemToDelete,
        isDeleting,
        openDeleteConfirm,
        closeDeleteConfirm,
        handleDeleteItem,
    } = useItems();

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Item Master Catalog</h1>
                    <p className="text-sm text-muted-foreground">Configure inventory item types, custom packs, reorder thresholds, and active availability.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
                >
                    Add Item
                </button>
            </div>

            {/* Query Parameters Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Filter catalog by code, description, brand..."
                    className="flex h-9 w-full sm:w-80 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={status}
                    className="flex h-9 w-44 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
                    onChange={(e) => setStatus(e.target.value as ItemStatusFilter)}
                >
                    {ITEM_STATUS_FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                    {error}
                </div>
            )}

            {isLoading && items.length === 0 ? (
                <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
                    Fetching item configuration tables...
                </div>
            ) : items.length === 0 ? (
                <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
                    <p className="text-sm font-medium text-muted-foreground">No item master entries matched your current lookup filters.</p>
                </div>
            ) : (
                <div className="relative w-full overflow-auto rounded-lg border border-border">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
                            <tr>
                                <th className="h-10 px-4 text-left align-middle">Code</th>
                                <th className="h-10 px-4 text-left align-middle">Item Description</th>
                                <th className="h-10 px-4 text-left align-middle">Attributes</th>
                                <th className="h-10 px-4 text-left align-middle">Tax (GST)</th>
                                <th className="h-10 px-4 text-left align-middle">Status</th>
                                <th className="h-10 px-4 text-right align-middle">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-muted/30">
                                    <td className="p-4 align-middle font-mono font-bold text-foreground text-xs uppercase tracking-wider">
                                        {item.itemCode}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="font-semibold text-foreground">{item.itemDesc}</div>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            {item.brand && <span>Brand: {item.brand}</span>}
                                            {item.category && <span>• Cat: {item.category}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-xs space-y-0.5">
                                        <div>Size: <span className="font-medium">{item.packSize} {item.unitName}</span></div>
                                        <div>Min Alert: <span className="font-medium text-amber-600">{item.reorderLevel}</span></div>
                                    </td>
                                    <td className="p-4 align-middle font-medium text-muted-foreground">
                                        {Number(item.gstPct)}%
                                    </td>
                                    <td className="p-4 align-middle">
                                        <button
                                            onClick={() => handleToggleActivation(item)}
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer border ${item.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-muted text-muted-foreground border-border"
                                                }`}
                                        >
                                            {item.isActive ? "Active" : "Disabled"}
                                        </button>
                                    </td>
                                    <td className="p-4 align-middle text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => openView(item)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent cursor-pointer"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => openEdit(item)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent text-amber-600 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(item)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-destructive/20 h-7 px-2.5 hover:bg-destructive/10 text-destructive cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Unified Modality Form Dialog Container Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border border-border w-full max-w-2xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {mode === "create" ? "Configure New Item Profile" : mode === "edit" ? `Modify Setup: ${selectedItem?.itemCode}` : `Item Master Blueprint: ${selectedItem?.itemCode}`}
                            </h3>
                            <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
                        </div>
                        <ItemForm
                            mode={mode}
                            initialData={selectedItem}
                            isSubmitting={isSubmitting}
                            formError={formError}
                            onSubmit={handleFormSubmit}
                            onCancel={closeDialog}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Alert Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border border-border w-full max-w-md rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2">Purge Item Master Entry</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you completely certain you want to purge <span className="font-semibold text-foreground">"{itemToDelete?.itemCode}"</span> from the configuration register? This check ensures no open bills depend on it, but cannot be easily undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteConfirm}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteItem}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2 cursor-pointer"
                            >
                                {isDeleting ? "Purging..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}