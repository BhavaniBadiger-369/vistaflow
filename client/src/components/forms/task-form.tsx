"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskSummary,
  type UserOption,
} from "@vistaflow/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(TASK_STATUS_OPTIONS),
  priority: z.enum(TASK_PRIORITY_OPTIONS),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  sectionId: z.string().min(1),
});

type TaskFormValues = z.infer<typeof schema>;

type TaskFormProps = {
  initialValues?: Partial<TaskSummary> | null;
  sections: Array<{ id: string; name: string }>;
  users: UserOption[];
  onSubmit: (values: {
    title: string;
    description?: string | null;
    status: TaskSummary["status"];
    priority: TaskSummary["priority"];
    dueDate?: string | null;
    assignedToId?: string | null;
    sectionId: string;
  }) => Promise<void>;
  submitting: boolean;
};

export function TaskForm({
  initialValues,
  sections,
  users,
  onSubmit,
  submitting,
}: TaskFormProps) {
  const defaultSectionId =
    initialValues?.sectionId ?? sections[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      status: initialValues?.status ?? "TODO",
      priority: initialValues?.priority ?? "MEDIUM",
      dueDate: initialValues?.dueDate
        ? new Date(initialValues.dueDate).toISOString().slice(0, 16)
        : "",
      assignedToId: initialValues?.assignedTo?.id ?? "",
      sectionId: defaultSectionId,
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...values,
          description: values.description?.trim() ? values.description : null,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
          assignedToId: values.assignedToId || null,
        }),
      )}
    >
      <div>
        <label className="mb-2 block text-sm font-medium">Task title</label>
        <Input {...register("title")} />
        {errors.title ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">{errors.title.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <Textarea {...register("description")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <Select {...register("status")}>
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <Select {...register("priority")}>
            {TASK_PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Due date</label>
          <Input type="datetime-local" {...register("dueDate")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Assignee</label>
          <Select {...register("assignedToId")}>
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Section</label>
        <Select {...register("sectionId")}>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </Select>
      </div>
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save task"}
      </Button>
    </form>
  );
}
