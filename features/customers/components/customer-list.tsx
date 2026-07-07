"use client";

import React from "react";
import { useCustomers } from "../hooks/use-customers";
import { CustomerForm } from "./customer-form";

export function CustomerList() {
    const {
        customers,
        search,
        setSearch,
        isLoading,
        error,
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
        isDeleteOpen,
        customerToDelete,
        isDeleting,
        openDeleteConfirm,
        closeDeleteConfirm,
        handleDeleteCustomer,
    } = useCustomers();

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Accounts</h1>
                    <p className="text-sm text-muted-foreground">Manage client information profiles, physical logistics, and taxation contexts.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
                >
                    Add Customer
                </button>
            </div>

            {/* Server-Side Debounced Filter Input */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <input
                    type="text"
                    placeholder="Search by name, mobile number, or GSTIN..."
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

            {isLoading && customers.length === 0 ? (
                <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
                    Querying customer registry...
                </div>
            ) : customers.length === 0 ? (
                <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
                    <p className="text-sm font-medium text-muted-foreground">No customer profiles discovered matching your query.</p>
                </div>
            ) : (
                <div className="relative w-full overflow-auto rounded-lg border border-border">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
                            <tr>
                                <th className="h-10 px-4 text-left align-middle">ID</th>
                                <th className="h-10 px-4 text-left align-middle">Customer Details</th>
                                <th className="h-10 px-4 text-left align-middle">Mobile Number</th>
                                <th className="h-10 px-4 text-left align-middle">GSTIN</th>
                                <th className="h-10 px-4 text-left align-middle">City Location</th>
                                <th className="h-10 px-4 text-right align-middle">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="transition-colors hover:bg-muted/30">
                                    <td className="p-4 align-middle font-medium">#{customer.id}</td>
                                    <td className="p-4 align-middle">
                                        <div className="font-semibold text-foreground">{customer.name}</div>
                                        {customer.contactPerson && (
                                            <div className="text-xs text-muted-foreground">Attn: {customer.contactPerson}</div>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground font-mono text-sm">
                                        {customer.mobileNo || "—"}
                                    </td>
                                    <td className="p-4 align-middle font-mono text-xs text-muted-foreground uppercase">
                                        {customer.gstin || "—"}
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">{customer.city || "—"}</td>
                                    <td className="p-4 align-middle text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => openView(customer)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent cursor-pointer"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => openEdit(customer)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent text-amber-600 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(customer)}
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

            {/* CRUD Core Dialog Framework */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border border-border w-full max-w-xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {mode === "create" ? "Open Customer Account" : mode === "edit" ? `Modify Account: ${selectedCustomer?.name}` : `Customer File: ${selectedCustomer?.name}`}
                            </h3>
                            <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
                        </div>
                        <CustomerForm
                            mode={mode}
                            initialData={selectedCustomer}
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
                        <h3 className="text-lg font-bold text-foreground mb-2">Delete Customer Profile</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you completely certain you want to remove <span className="font-semibold text-foreground">"{customerToDelete?.name}"</span>? This will wipe the customer profile record and cannot be undone.
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
                                onClick={handleDeleteCustomer}
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