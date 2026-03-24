import type { UserOption } from "@vistaflow/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type UsersTableProps = {
  users: UserOption[];
  canEdit: boolean;
  onEdit?: (user: UserOption) => void;
};

export function UsersTable({ users, canEdit, onEdit }: UsersTableProps) {
  return (
    <Card className="overflow-hidden rounded-[30px] p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="surface-muted">
            <tr>
              {["User", "Role", "Manager", "Reports", ""].map((label) => (
                <th key={label} className="px-4 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[rgba(var(--border),0.6)]">
                <td className="px-4 py-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-[rgb(var(--muted))]">{user.email}</p>
                </td>
                <td className="px-4 py-4">
                  <Badge tone="primary">{user.role}</Badge>
                </td>
                <td className="px-4 py-4">{user.manager?.name ?? "None"}</td>
                <td className="px-4 py-4">{user.managedCount ?? 0}</td>
                <td className="px-4 py-4 text-right">
                  {canEdit && onEdit ? (
                    <Button variant="ghost" onClick={() => onEdit(user)}>
                      Edit
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
