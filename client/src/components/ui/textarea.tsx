import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border bg-[rgba(var(--surface),0.88)] px-4 py-3 text-sm outline-none placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--primary))]",
        className,
      )}
      {...props}
    />
  );
}
