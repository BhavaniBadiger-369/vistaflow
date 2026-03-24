"use client";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, type UserOption } from "@vistaflow/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TaskFilters = {
  q: string;
  status: string;
  priority: string;
  assigneeId: string;
  projectId: string;
  dateFrom: string;
  dateTo: string;
};

type TaskFilterBarProps = {
  filters: TaskFilters;
  projects: Array<{ id: string; name: string }>;
  users: UserOption[];
  onChange: (next: TaskFilters) => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  onCreate?: () => void;
};

export function TaskFilterBar({
  filters,
  projects,
  users,
  onChange,
  onExportCsv,
  onExportXlsx,
  onCreate,
}: TaskFilterBarProps) {
  return (
    <div className="surface-card grid gap-3 rounded-[30px] p-4 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
      <Input
        placeholder="Search tasks or projects"
        value={filters.q}
        onChange={(event) => onChange({ ...filters, q: event.target.value })}
      />
      <Select
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value })}
      >
        <option value="">All statuses</option>
        {TASK_STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>
      <Select
        value={filters.priority}
        onChange={(event) => onChange({ ...filters, priority: event.target.value })}
      >
        <option value="">All priorities</option>
        {TASK_PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </Select>
      <Select
        value={filters.assigneeId}
        onChange={(event) => onChange({ ...filters, assigneeId: event.target.value })}
      >
        <option value="">All assignees</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </Select>
      <Select
        value={filters.projectId}
        onChange={(event) => onChange({ ...filters, projectId: event.target.value })}
      >
        <option value="">All projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <Input
        type="datetime-local"
        value={filters.dateFrom}
        onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
      />
      <Input
        type="datetime-local"
        value={filters.dateTo}
        onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
      />
      <div className="flex flex-wrap gap-2 lg:col-span-3 lg:justify-end">
        <Button variant="secondary" onClick={onExportCsv}>
          Export CSV
        </Button>
        <Button variant="secondary" onClick={onExportXlsx}>
          Export Excel
        </Button>
        {onCreate ? <Button onClick={onCreate}>New task</Button> : null}
      </div>
    </div>
  );
}
