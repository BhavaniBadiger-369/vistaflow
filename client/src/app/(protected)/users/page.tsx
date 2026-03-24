"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { PaginatedResponse, UserOption } from "@vistaflow/shared";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { UserForm } from "@/components/forms/user-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { UsersTable } from "@/components/tables/users-table";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function UsersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN";
  const [users, setUsers] = useState<UserOption[]>([]);
  const [managers, setManagers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [editingUser, setEditingUser] = useState<UserOption | null>(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<UserOption>>("/users", {
        params: {
          page,
          pageSize: 10,
          q: debouncedQuery || undefined,
          role: role || undefined,
        },
      });

      setUsers(data.data);
      setPageCount(data.meta.pageCount);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, role]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!canEdit) {
      return;
    }

    void api
      .get<PaginatedResponse<UserOption>>("/users", {
        params: { page: 1, pageSize: 50 },
      })
      .then((response) => {
        setManagers(response.data.data.filter((candidate) => candidate.role !== "MEMBER"));
      });
  }, [canEdit]);

  const handleSaveUser = async (values: { name: string; role: UserOption["role"]; managerId?: string | null }) => {
    if (!editingUser) {
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/users/${editingUser.id}`, values);
      toast.success("User updated");
      setEditingUser(null);
      await loadUsers();
    } catch {
      toast.error("Unable to update user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
      <div className="space-y-6">
        <section>
          <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
            Team directory
          </p>
          <h2 className="mt-2 font-mono text-3xl font-semibold">
            Roles and reporting lines
          </h2>
        </section>

        <div className="surface-card grid gap-3 rounded-[30px] p-4 lg:grid-cols-[1.6fr_1fr_auto_auto]">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email"
          />
          <Select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="MEMBER">MEMBER</option>
          </Select>
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={page === pageCount}
            onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
          >
            Next
          </Button>
        </div>

        {loading && !users.length ? (
          <LoadingScreen />
        ) : users.length ? (
          <UsersTable
            users={users}
            canEdit={canEdit}
            onEdit={canEdit ? setEditingUser : undefined}
          />
        ) : (
          <EmptyState
            title="No users found"
            description="Try widening the current filters."
          />
        )}

        <Modal
          open={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title="Update user"
        >
          <UserForm
            initialValues={
              editingUser
                ? {
                    id: editingUser.id,
                    name: editingUser.name,
                    role: editingUser.role,
                    manager: editingUser.manager,
                  }
                : null
            }
            managers={managers}
            onSubmit={handleSaveUser}
            submitting={submitting}
          />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
