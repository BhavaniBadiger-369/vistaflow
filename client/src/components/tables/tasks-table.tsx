"use client";

import { TASK_STATUS_OPTIONS, type Role, type TaskSummary } from "@vistaflow/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

type TasksTableProps = {
  tasks: TaskSummary[];
  role: Role;
  onEdit?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  onStatusChange?: (taskId: string, status: TaskSummary["status"]) => void;
};

export function TasksTable({
  tasks,
  role,
  onEdit,
  onDelete,
  onStatusChange,
}: TasksTableProps) {
  return (
    <Card className="overflow-hidden rounded-[30px] p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="surface-muted">
            <tr>
              {["Task", "Project", "Priority", "Due", "Assignee", "Status", ""].map(
                (label) => (
                  <th key={label} className="px-4 py-3 font-medium">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-[rgba(var(--border),0.6)]">
                <td className="px-4 py-4">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-[rgb(var(--muted))]">{task.section.name}</p>
                </td>
                <td className="px-4 py-4">{task.project.name}</td>
                <td className="px-4 py-4">
                  <Badge tone={task.priority === "HIGH" ? "danger" : task.priority === "MEDIUM" ? "warning" : "success"}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-4 py-4">{formatDate(task.dueDate)}</td>
                <td className="px-4 py-4">{task.assignedTo?.name ?? "Unassigned"}</td>
                <td className="px-4 py-4">
                  {onStatusChange ? (
                    <Select
                      value={task.status}
                      onChange={(event) =>
                        onStatusChange(task.id, event.target.value as TaskSummary["status"])
                      }
                      className="min-w-[160px]"
                    >
                      {TASK_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge tone={task.status === "DONE" ? "success" : "primary"}>
                      {task.status}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {role !== "MEMBER" && onEdit ? (
                      <Button variant="ghost" onClick={() => onEdit(task)}>
                        Edit
                      </Button>
                    ) : null}
                    {role !== "MEMBER" && onDelete ? (
                      <Button variant="ghost" onClick={() => onDelete(task)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
