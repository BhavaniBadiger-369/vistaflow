"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { roleDashboardPath } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@vistaflow.com",
      password: "Admin@123",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", values);
      setUser(data.user);
      toast.success("Welcome back");

      const next = searchParams.get("next");
      router.push(next || roleDashboardPath(data.user.role));
    } catch (error) {
      toast.error("Invalid email or password");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <Input {...register("email")} placeholder="you@company.com" />
        {errors.email ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <Input {...register("password")} placeholder="Enter password" type="password" />
        {errors.password ? (
          <p className="mt-1 text-xs text-[rgb(var(--danger))]">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-sm text-[rgb(var(--muted))]">
        New to VistaFlow?{" "}
        <Link href="/register" className="font-semibold text-[rgb(var(--primary))]">
          Create an account
        </Link>
      </p>
    </form>
  );
}
