"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90",
  secondary:
    "surface-card text-[rgb(var(--foreground))] hover:bg-[rgba(var(--surface-alt),0.95)]",
  ghost:
    "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgba(var(--surface-alt),0.65)]",
  danger:
    "bg-[rgb(var(--danger))] text-white hover:opacity-90",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-soft disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
