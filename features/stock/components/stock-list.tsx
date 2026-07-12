"use client";

import React from "react";
import { useStock } from "../hooks/use-stock";
import { StockForm } from "./stock-form";

export function StockList() {
  const {
    stocks,
    lowStockFilter,
    setLowStockFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    isOpen,
    mode,
    selectedStock,
    openOpeningModal,
    openAdjustModal,
    openViewModal,
    closeDialog,
    isSubmitting,
    formError,
    handleOpeningSubmit,
    handleAdjustSubmit,
  } = useStock();

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Stock Ledger</h1>
          <p className="text-sm text-muted-foreground">Monitor real-time product quantities, track inventory volumes, and execute audit trail corrections.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openOpeningModal}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent h-9 px-4 py-2 cursor-pointer"
          >
            Seed Opening Stock
          </button>
          <button
            onClick={() => openAdjustModal()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
          >
            Manual Adjust
          </button>
        </div>
      </div>

      {/* Query Search Filters Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/20 p-4 rounded-lg border">
        <input
          type="text"
          placeholder="Filter stock records by description, code or identity tags..."
          className="flex h-9 w-full sm:w-80 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <label className="flex items-center space-x-2 text-sm font-medium text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-sm border border-input accent-primary cursor-pointer"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
          />
          <span className="text-rose-600 font-semibold uppercase tracking-wider text-xs">Isolate Low Reorder Violations Only</span>
        </label>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      {isLoading && stocks.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
          Querying ledger tracking logs...
        </div>
      ) : stocks.length === 0 ? (
        <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
          <p className="text-sm font-medium text-muted-foreground">No asset lines discovered matching your search criteria filters.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-auto rounded-lg border border-border">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th className="h-10 px-4 text-left align-middle">Code</th>
                <th className="h-10 px-4 text-left align-middle">Item Profile Metadata</th>
                <th className="h-10 px-4 text-center align-middle">Pack Split Ratio</th>
                <th className="h-10 px-4 text-right align-middle">Total Pieces Available</th>
                <th className="h-10 px-4 text-center align-middle">Status Alert</th>
                <th className="h-10 px-4 text-right align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stocks.map((stock) => {
                const isViolated = stock.currentStockPieces <= stock.item.reorderLevel;
                const packs = Math.floor(stock.currentStockPieces / stock.item.packSize);
                const loose = stock.currentStockPieces % stock.item.packSize;

                return (
                  <tr key={stock.itemId} className="transition-colors hover:bg-muted/30">
                    <td className="p-4 align-middle font-mono font-bold text-xs uppercase tracking-wider text-foreground">
                      {stock.item.itemCode}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="font-semibold text-foreground">{stock.item.itemDesc}</div>
                      <div className="text-xs text-muted-foreground flex gap-2">
                        {stock.item.brand && <span>Brand: {stock.item.brand}</span>}
                        {stock.item.category && <span>• Cat: {stock.item.category}</span>}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center font-mono text-xs text-muted-foreground">
                      {packs} Pks + {loose} Ls <span className="text-[10px] block text-muted-foreground/60">({stock.item.packSize}/{stock.item.unitName})</span>
                    </td>
                    <td className="p-4 align-middle text-right font-bold font-mono text-sm text-foreground">
                      {stock.currentStockPieces}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isViolated
                          ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {isViolated ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openViewModal(stock)}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent cursor-pointer"
                      >
                        Breakdown
                      </button>
                      <button
                        onClick={() => openAdjustModal(stock)}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-secondary text-secondary-foreground h-7 px-2.5 hover:bg-secondary/80 cursor-pointer"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modality overlay frame container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border w-full max-w-lg rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
                {mode === "opening" ? "Seed Inventory Opening Profile" : mode === "adjust" ? "Log Correction Adjustment" : "Inventory Snapshot Summary"}
              </h3>
              <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
            </div>
            <StockForm
              mode={mode}
              initialStock={selectedStock}
              isSubmitting={isSubmitting}
              formError={formError}
              onOpeningSubmit={handleOpeningSubmit}
              onAdjustSubmit={handleAdjustSubmit}
              onCancel={closeDialog}
            />
          </div>
        </div>
      )}
    </div>
  );
}