"use client";

import React from "react";
import { useSales } from "../hooks/use-sales";
import { SaleForm } from "./sale-form";

export function SaleList() {
  const {
    sales,
    isLoading,
    error,
    customerIdFilter,
    setCustomerIdFilter,
    statusFilter,
    setStatusFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    isOpen,
    mode,
    selectedSale,
    openCreate,
    openView,
    closeDialog,
    isSubmitting,
    formError,
    handleFormSubmit,
    handleUpdateStatus,
  } = useSales();

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Billing Dashboard</h1>
          <p className="text-sm text-muted-foreground">Log counter sales, calculate automated wholesale discounts, track payment status, and review tax metrics.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
        >
          New Sales Invoice
        </button>
      </div>

      {/* Audit Parameters Filtering row section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-lg border border-border/60">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Account ID</label>
          <input
            type="number"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
            placeholder="Search Account ID..."
            value={customerIdFilter ?? ""}
            onChange={(e) => setCustomerIdFilter(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Collection Status</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Bills</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partial Due</option>
            <option value="PENDING">Pending Collection</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Start Billing Window</label>
          <input
            type="date"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">End Billing Window</label>
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

      {isLoading && sales.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
          Summing sales index files...
        </div>
      ) : sales.length === 0 ? (
        <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
          <p className="text-sm font-medium text-muted-foreground">No transaction records matched your active filtering horizons.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-auto rounded-lg border border-border">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th className="h-10 px-4 text-left align-middle">Invoice Code</th>
                <th className="h-10 px-4 text-left align-middle">Bill Date</th>
                <th className="h-10 px-4 text-left align-middle">Customer Account Profile</th>
                <th className="h-10 px-4 text-center align-middle">Collection Flag</th>
                <th className="h-10 px-4 text-right align-middle">Net Payable Sum</th>
                <th className="h-10 px-4 text-right align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4 align-middle font-mono font-bold text-xs">#INV-{sale.id}</td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {new Date(sale.billDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="font-semibold text-foreground">{sale.customer?.name || `Customer Account #${sale.customerId}`}</div>
                    {sale.customer?.gstin && <div className="text-xs font-mono text-muted-foreground uppercase">{sale.customer.gstin}</div>}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <select
                      value={sale.paymentStatus}
                      onChange={(e) => handleUpdateStatus(sale.id, e.target.value as any)}
                      className={`text-xs font-bold rounded px-2 py-0.5 border bg-transparent cursor-pointer ${
                        sale.paymentStatus === "PAID"
                          ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                          : sale.paymentStatus === "PARTIAL"
                          ? "text-amber-700 border-amber-200 bg-amber-50"
                          : "text-rose-700 border-rose-200 bg-rose-50"
                      }`}
                    >
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </td>
                  <td className="p-4 align-middle text-right font-bold font-mono text-emerald-600">
                    ₹{Number(sale.netAmount).toFixed(2)}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <button
                      onClick={() => openView(sale.id)}
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-3 hover:bg-accent cursor-pointer"
                    >
                      Review Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Overlay modal review frame */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border w-full max-w-7xl rounded-lg shadow-lg p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {mode === "create" ? "Establish Sales Billing Invoice" : `Review Historical Sales Invoice Blueprint #INV-${selectedSale?.id}`}
              </h3>
              <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
            </div>
            <SaleForm
              mode={mode}
              initialData={selectedSale}
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