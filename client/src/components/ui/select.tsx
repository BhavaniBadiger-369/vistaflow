import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border bg-[rgba(var(--surface),0.88)] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--primary))]",
        className,
      )}
      {...props}
    />
  );
}
