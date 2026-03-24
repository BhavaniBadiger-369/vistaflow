"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ROLE_OPTIONS, type UserOption } from "@vistaflow/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(2),
  role: z.enum(ROLE_OPTIONS),
  managerId: z.string().optional(),
});

type UserFormValues = z.infer<typeof schema>;

type UserFormProps = {
  initialValues?: {
    id: string;
    name: string;
    role: UserOption["role"];
    manager?: { id: string } | null;
  } | null;
  managers: UserOption[];
  onSubmit: (values: { name: string; role: UserOption["role"]; managerId?: string | null }) => Promise<void>;
  submitting: boolean;
};

export function UserForm({
  initialValues,
  managers,
  onSubmit,
  submitting,
}: UserFormProps) {
  const {
    control,
    register,
    handleSubmit,
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      role: initialValues?.role ?? "MEMBER",
      managerId: initialValues?.manager?.id ?? "",
    },
  });

  const role = useWatch({ control, name: "role" });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: values.name,
          role: values.role,
          managerId: values.role === "MEMBER" ? values.managerId || null : null,
        }),
      )}
    >
      <div>
        <label className="mb-2 block text-sm font-medium">Name</label>
        <Input {...register("name")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Role</label>
          <Select {...register("role")}>
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        {role === "MEMBER" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">Manager</label>
            <Select {...register("managerId")}>
              <option value="">No manager</option>
              {managers
                .filter((manager) => manager.id !== initialValues?.id)
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
            </Select>
          </div>
        ) : null}
      </div>
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save user"}
      </Button>
    </form>
  );
}
