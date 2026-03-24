"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2),
  order: z.number().int().min(0),
});

type SectionFormValues = z.infer<typeof schema>;

type SectionFormProps = {
  initialValues?: { name?: string; order?: number } | null;
  onSubmit: (values: SectionFormValues) => Promise<void>;
  submitting: boolean;
};

export function SectionForm({
  initialValues,
  onSubmit,
  submitting,
}: SectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      order: initialValues?.order ?? 0,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-2 block text-sm font-medium">Section name</label>
        <Input {...register("name")} />
        {errors.name ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Display order</label>
        <Input type="number" {...register("order", { valueAsNumber: true })} />
      </div>
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save section"}
      </Button>
    </form>
  );
}
