"use client";

import { useState, useEffect, useCallback } from "react";
import type { User, UserMode } from "../types/user";
import { getUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser } from "../api/user.api";
import { type UserFormValues, formValuesToApi } from "../schemas/user.schema";

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State Configurations Map
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<UserMode>("create");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Deletion Confirmation Context Flags
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = useCallback(async (searchQuery?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUsers(searchQuery);
            setUsers(data);
        } catch (err: any) {
            setError(err.message || "Failed to read internal user account registry map.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(search || undefined);
        }, 350);

        return () => clearTimeout(timer);
    }, [search, fetchUsers]);

    const openCreate = useCallback(() => {
        setSelectedUser(null);
        setMode("create");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((user: User) => {
        setSelectedUser(user);
        setMode("edit");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const openView = useCallback((user: User) => {
        setSelectedUser(user);
        setMode("view");
        setFormError(null);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        setSelectedUser(null);
        setFormError(null);
    }, []);

    const openDeleteConfirm = useCallback((user: User) => {
        setUserToDelete(user);
        setIsDeleteOpen(true);
    }, []);

    const closeDeleteConfirm = useCallback(() => {
        setIsDeleteOpen(false);
        setUserToDelete(null);
    }, []);

    const handleToggleActivation = useCallback(async (user: User) => {
        setIsLoading(true);
        try {
            if (user.isActive) {
                await deactivateUser(user.id);
            } else {
                await activateUser(user.id);
            }
            await fetchUsers(search || undefined);
        } catch (err: any) {
            setError(err.message || "Failed to successfully flip active access permissions.");
        } finally {
            setIsLoading(false);
        }
    }, [search, fetchUsers]);

    const handleFormSubmit = useCallback(async (values: UserFormValues) => {
        // Guard check to prevent submission out of read-only mode states
        if (mode === "view") return;

        setIsSubmitting(true);
        setFormError(null);
        try {
            // TypeScript now safely knows mode can only be "create" or "edit" here
            const payload = formValuesToApi(values, mode);
            if (mode === "create") {
                await createUser(payload);
            } else if (mode === "edit" && selectedUser) {
                await updateUser(selectedUser.id, payload);
            }
            await fetchUsers(search || undefined);
            closeDialog();
        } catch (err: any) {
            setFormError(err.message || "An unexpected error blocked user update persistence.");
        } finally {
            setIsSubmitting(false);
        }
    }, [mode, selectedUser, search, fetchUsers, closeDialog]);

    const handleDeleteUser = useCallback(async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await deleteUser(userToDelete.id);
            await fetchUsers(search || undefined);
            closeDeleteConfirm();
        } catch (err: any) {
            setError(err.message || "Failed to drop identity entity safely from datastore mapping.");
        } finally {
            setIsDeleting(false);
        }
    }, [userToDelete, search, fetchUsers, closeDeleteConfirm]);

    return {
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
        refresh: () => fetchUsers(search || undefined),
    };
}