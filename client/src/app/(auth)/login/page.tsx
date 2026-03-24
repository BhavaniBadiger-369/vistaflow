"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { roleDashboardPath } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
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
          Sign in
        </p>
        <h1 className="mt-2 font-mono text-3xl font-semibold">
          Enter your VistaFlow workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
          Use one of the seeded demo accounts or create a new role-based user.
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
