import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border bg-[rgba(var(--surface),0.88)] px-4 py-3 text-sm outline-none ring-0 placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--primary))]",
        className,
      )}
      {...props}
    />
  );
}
