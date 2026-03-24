import { Inbox } from "lucide-react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="rounded-full bg-[rgba(var(--surface-alt),0.9)] p-3">
        <Inbox className="h-5 w-5 text-[rgb(var(--muted))]" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</p>
      </div>
    </Card>
  );
}
