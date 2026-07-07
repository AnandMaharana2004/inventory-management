"use client";

import React from "react";
import { useVendors } from "../hooks/use-vendors";
import { VendorForm } from "./vendor-form";

export function VendorList() {
    const {
        vendors,
        search,
        setSearch,
        isLoading,
        error,
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
        isDeleteOpen,
        vendorToDelete,
        isDeleting,
        openDeleteConfirm,
        closeDeleteConfirm,
        handleDeleteVendor,
    } = useVendors();

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Registry</h1>
                    <p className="text-sm text-muted-foreground">Monitor wholesale merchant records and operational context fields.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
                >
                    Add Vendor
                </button>
            </div>

            {/* Live Server-Side Debounced Input Filtering */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <input
                    type="text"
                    placeholder="Filter vendors dynamically by corporate name..."
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                    {error}
                </div>
            )}

            {isLoading && vendors.length === 0 ? (
                <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
                    Querying remote database registry...
                </div>
            ) : vendors.length === 0 ? (
                <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
                    <p className="text-sm font-medium text-muted-foreground">No merchant entities matched your current filters.</p>
                </div>
            ) : (
                <div className="relative w-full overflow-auto rounded-lg border border-border">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
                            <tr>
                                <th className="h-10 px-4 text-left align-middle">ID</th>
                                <th className="h-10 px-4 text-left align-middle">Vendor Entity Name</th>
                                <th className="h-10 px-4 text-left align-middle">Tax Identity (GSTIN)</th>
                                <th className="h-10 px-4 text-left align-middle">Contact Person</th>
                                <th className="h-10 px-4 text-left align-middle">Email Address</th>
                                <th className="h-10 px-4 text-right align-middle">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="transition-colors hover:bg-muted/30">
                                    <td className="p-4 align-middle font-medium">#{vendor.id}</td>
                                    <td className="p-4 align-middle font-medium text-foreground">{vendor.name}</td>
                                    <td className="p-4 align-middle font-mono text-xs text-muted-foreground uppercase">
                                        {vendor.gstin || "N/A"}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="text-sm font-medium">{vendor.contactPerson || "—"}</div>
                                        <div className="text-xs text-muted-foreground">{vendor.contactNumber}</div>
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">{vendor.email || "—"}</td>
                                    <td className="p-4 align-middle text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => openView(vendor)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent cursor-pointer"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => openEdit(vendor)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent text-amber-600 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(vendor)}
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

            {/* CRUD Master Dialog Shell Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border border-border w-full max-w-xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {mode === "create" ? "Register New Production Vendor" : mode === "edit" ? `Edit Configuration: ${selectedVendor?.name}` : `Contract Metadata File: ${selectedVendor?.name}`}
                            </h3>
                            <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
                        </div>
                        <VendorForm
                            mode={mode}
                            initialData={selectedVendor}
                            isSubmitting={isSubmitting}
                            formError={formError}
                            onSubmit={handleFormSubmit}
                            onCancel={closeDialog}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Alert Modal Dialog */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border border-border w-full max-w-md rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2">Confirm Entity Deletion</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you absolutely certain you want to remove <span className="font-semibold text-foreground">"{vendorToDelete?.name}"</span>? This operations process runs cascade verification checks and cannot be easily undone.
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
                                onClick={handleDeleteVendor}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2 cursor-pointer"
                            >
                                {isDeleting ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}