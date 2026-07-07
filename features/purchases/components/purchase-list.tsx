"use client";

import React from "react";
import { usePurchases } from "../hooks/use-purchases";
import { PurchaseForm } from "./purchase-form";

export function PurchaseList() {
    const {
        purchases,
        isLoading,
        error,
        vendorIdFilter,
        setVendorIdFilter,
        startDateFilter,
        setStartDateFilter,
        endDateFilter,
        setEndDateFilter,
        isOpen,
        mode,
        selectedPurchase,
        openCreate,
        openView,
        closeDialog,
        isSubmitting,
        formError,
        handleFormSubmit,
    } = usePurchases();

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchase History Ledger</h1>
                    <p className="text-sm text-muted-foreground">
                        Audit wholesale stock influx orders, manage vendor accounting parameters, and verify complex rate basis tax pools.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
                >
                    Post Purchase Invoice
                </button>
            </div>

            {/* Audit Pipeline Filtering Parameters Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/30 p-4 rounded-lg border border-border/60">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Filter by Vendor ID</label>
                    <input
                        type="number"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
                        placeholder="Search Supplier ID..."
                        value={vendorIdFilter ?? ""}
                        onChange={(e) => setVendorIdFilter(e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Start Block Horizon</label>
                    <input
                        type="date"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">End Block Horizon</label>
                    <input
                        type="date"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                    {error}
                </div>
            )}

            {isLoading && purchases.length === 0 ? (
                <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
                    Summing asset logs...
                </div>
            ) : purchases.length === 0 ? (
                <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
                    <p className="text-sm font-medium text-muted-foreground">No historical records matched your specified pipeline parameters.</p>
                </div>
            ) : (
                <div className="relative w-full overflow-auto rounded-lg border border-border">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
                            <tr>
                                <th className="h-10 px-4 text-left align-middle">PO Number</th>
                                <th className="h-10 px-4 text-left align-middle">Booking Date</th>
                                <th className="h-10 px-4 text-left align-middle">Merchant Supplier Name</th>
                                <th className="h-10 px-4 text-left align-middle">Invoice Code</th>
                                <th className="h-10 px-4 text-right align-middle">Net Influx Sum</th>
                                <th className="h-10 px-4 text-right align-middle">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {purchases.map((po) => (
                                <tr key={po.id} className="transition-colors hover:bg-muted/30">
                                    <td className="p-4 align-middle font-mono font-bold text-xs">#PO-{po.id}</td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {new Date(po.poDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="font-semibold text-foreground">{po.vendor?.name || `Vendor #${po.vendorId}`}</div>
                                        {po.vendor?.gstin && <div className="text-xs font-mono text-muted-foreground uppercase">{po.vendor.gstin}</div>}
                                    </td>
                                    <td className="p-4 align-middle font-mono text-xs tracking-wider">
                                        {po.invoiceNumber || "—"}
                                    </td>
                                    <td className="p-4 align-middle text-right font-bold font-mono text-emerald-600">
                                        ₹{Number(po.netAmount).toFixed(2)}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <button
                                            onClick={() => openView(po.id)}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-3 hover:bg-accent cursor-pointer"
                                        >
                                            View Invoice
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sub-system Overlay Modal Screen Frame */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border border-border w-full max-w-5xl rounded-lg shadow-lg p-6 max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {mode === "create" ? "Establish Wholesale Stock Entry" : `Purchase Bill Document Review #PO-${selectedPurchase?.id}`}
                            </h3>
                            <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
                        </div>
                        <PurchaseForm
                            mode={mode}
                            initialData={selectedPurchase}
                            isSubmitting={isSubmitting}
                            formError={formError}
                            onSubmit={handleFormSubmit}
                            onCancel={closeDialog}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}