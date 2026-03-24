"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PROJECT_STATUS_OPTIONS, type ProjectSummary, type UserOption } from "@vistaflow/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUS_OPTIONS),
  ownerId: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof schema>;

type ProjectFormProps = {
  initialValues?: Partial<ProjectSummary> | null;
  owners: UserOption[];
  isManager: boolean;
  onSubmit: (values: {
    name: string;
    description?: string | null;
    status: ProjectSummary["status"];
    ownerId?: string;
  }) => Promise<void>;
  submitting: boolean;
};

export function ProjectForm({
  initialValues,
  owners,
  isManager,
  onSubmit,
  submitting,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      status: initialValues?.status ?? "PLANNING",
      ownerId: initialValues?.owner?.id ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...values,
          description: values.description?.trim() ? values.description : null,
          ownerId: values.ownerId || undefined,
        }),
      )}
    >
      <div>
        <label className="mb-2 block text-sm font-medium">Project name</label>
        <Input {...register("name")} />
        {errors.name ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
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
            {PROJECT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        {!isManager ? (
          <div>
            <label className="mb-2 block text-sm font-medium">Owner</label>
            <Select {...register("ownerId")}>
              <option value="">Current user</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.role})
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save project"}
      </Button>
    </form>
  );
}
