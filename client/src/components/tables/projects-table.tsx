import type { ProjectSummary } from "@vistaflow/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type ProjectsTableProps = {
  projects: ProjectSummary[];
  selectedId?: string | null;
  onSelect: (projectId: string) => void;
  onEdit?: (project: ProjectSummary) => void;
  onDelete?: (project: ProjectSummary) => void;
};

export function ProjectsTable({
  projects,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  return (
    <Card className="overflow-hidden rounded-[30px] p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="surface-muted">
            <tr>
              {["Project", "Status", "Owner", "Updated", "Completion", ""].map(
                (label) => (
                  <th key={label} className="px-4 py-3 font-medium">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className={
                  project.id === selectedId
                    ? "bg-[rgba(var(--primary),0.1)]"
                    : "border-t border-[rgba(var(--border),0.6)]"
                }
              >
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(project.id)}
                    className="text-left"
                  >
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-xs text-[rgb(var(--muted))]">
                      {project.taskCount} tasks
                    </p>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <Badge tone="primary">{project.status}</Badge>
                </td>
                <td className="px-4 py-4">{project.owner.name}</td>
                <td className="px-4 py-4">{formatDate(project.updatedAt)}</td>
                <td className="px-4 py-4">{project.completion}%</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit ? (
                      <Button variant="ghost" onClick={() => onEdit(project)}>
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button variant="ghost" onClick={() => onDelete(project)}>
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
