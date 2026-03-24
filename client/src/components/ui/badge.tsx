import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary";
  className?: string;
};

const toneMap: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral:
    "bg-[rgba(var(--surface-alt),0.82)] text-[rgb(var(--foreground))]",
  success: "bg-[rgba(var(--success),0.15)] text-[rgb(var(--success))]",
  warning: "bg-[rgba(var(--warning),0.16)] text-[rgb(var(--warning))]",
  danger: "bg-[rgba(var(--danger),0.16)] text-[rgb(var(--danger))]",
  primary: "bg-[rgba(var(--primary),0.14)] text-[rgb(var(--primary))]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
