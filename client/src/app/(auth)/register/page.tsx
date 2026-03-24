"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { roleDashboardPath } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (initialized && user) {
      router.replace(roleDashboardPath(user.role));
    }
  }, [initialized, router, user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
          Register
        </p>
        <h1 className="mt-2 font-mono text-3xl font-semibold">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
          Create an account and choose your role to start managing projects and tasks.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}