"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div
        className={cn(
          "surface-card relative w-full max-w-2xl rounded-[30px] p-6",
          className,
        )}
      >
        <button
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-[rgba(var(--surface-alt),0.9)]"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-5 pr-10">
          <h2 className="font-mono text-xl font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
