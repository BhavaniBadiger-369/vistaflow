"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ROLE_OPTIONS } from "@vistaflow/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { roleDashboardPath } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Use upper, lower, and number"),
  role: z.enum(ROLE_OPTIONS),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "MEMBER",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/register", values);
      setUser(data.user);
      toast.success("Account created");
      router.push(roleDashboardPath(data.user.role));
    } catch (error) {
      toast.error("Unable to create account");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Full name</label>
        <Input {...register("name")} placeholder="Jordan Lee" />
        {errors.name ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <Input {...register("email")} placeholder="you@company.com" />
        {errors.email ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <Input {...register("password")} type="password" />
        {errors.password ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Role</label>
        <Select {...register("role")}>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </div>
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-sm text-[rgb(var(--muted))]">
        Already have access?{" "}
        <Link href="/login" className="font-semibold text-[rgb(var(--primary))]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
