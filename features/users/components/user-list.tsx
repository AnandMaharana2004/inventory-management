"use client";

import React from "react";
import { useUsers } from "../hooks/use-users";
import { UserForm } from "./user-form";

export function UserList() {
  const {
    users,
    search,
    setSearch,
    isLoading,
    error,
    isOpen,
    mode,
    selectedUser,
    openCreate,
    openEdit,
    openView,
    closeDialog,
    isSubmitting,
    formError,
    handleFormSubmit,
    handleToggleActivation,
    isDeleteOpen,
    userToDelete,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteUser,
  } = useUsers();

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Administer workforce accounts, security permission definitions, and toggle system activity status states.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 h-9 px-4 py-2 cursor-pointer"
        >
          Add User Account
        </button>
      </div>

      {/* Reactive Server Search */}
      <div className="flex w-full max-w-sm items-center space-x-2">
        <input
          type="text"
          placeholder="Filter accounts by full name..."
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

      {isLoading && users.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-sm text-muted-foreground animate-pulse">
          Querying application authentication tables...
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed rounded-lg h-48 flex flex-col justify-center items-center text-center p-4">
          <p className="text-sm font-medium text-muted-foreground">No accounts discovered matching your lookup query.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-auto rounded-lg border border-border">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th className="h-10 px-4 text-left align-middle">ID</th>
                <th className="h-10 px-4 text-left align-middle">Staff Name</th>
                <th className="h-10 px-4 text-left align-middle">Login Email</th>
                <th className="h-10 px-4 text-left align-middle">Security Role</th>
                <th className="h-10 px-4 text-left align-middle">Access Flag</th>
                <th className="h-10 px-4 text-right align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4 align-middle font-mono text-xs text-muted-foreground">#{user.id}</td>
                  <td className="p-4 align-middle">
                    <div className="font-semibold text-foreground">{user.name}</div>
                    {user.contactNumber && (
                      <div className="text-xs text-muted-foreground">{user.contactNumber}</div>
                    )}
                  </td>
                  <td className="p-4 align-middle text-muted-foreground font-mono text-xs">{user.email || "—"}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase border ${
                      user.role === "ADMIN" 
                        ? "bg-purple-50 text-purple-700 border-purple-200" 
                        : user.role === "MANAGER"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <button
                      onClick={() => handleToggleActivation(user)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer border ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {user.isActive ? "Allowed" : "Revoked"}
                    </button>
                  </td>
                  <td className="p-4 align-middle text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openView(user)}
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEdit(user)}
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input h-7 px-2.5 hover:bg-accent text-amber-600 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(user)}
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

      {/* Unified Modality Dialog Frame overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border w-full max-w-xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {mode === "create" ? "Provision Staff Account" : mode === "edit" ? `Edit Role Matrix: ${selectedUser?.name}` : `Staff Context File: ${selectedUser?.name}`}
              </h3>
              <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground text-sm cursor-pointer">✕</button>
            </div>
            <UserForm
              mode={mode}
              initialData={selectedUser}
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
            <h3 className="text-lg font-bold text-foreground mb-2">Terminate User Account</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you absolutely certain you want to remove <span className="font-semibold text-foreground">"{userToDelete?.name}"</span>? Deleting a staff account sweeps cascading logs and references from the server system registry, which cannot be reversed.
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
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2 cursor-pointer"
              >
                {isDeleting ? "Terminating..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}