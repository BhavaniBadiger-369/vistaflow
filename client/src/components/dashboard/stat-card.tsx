import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
};

export function StatCard({ title, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="space-y-4 rounded-[28px]">
      <div className="flex items-start justify-between">
        <div className="rounded-2xl bg-[rgba(var(--primary),0.14)] p-3 text-[rgb(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-[rgb(var(--muted))]" />
      </div>
      <div>
        <p className="text-sm text-[rgb(var(--muted))]">{title}</p>
        <p className="mt-2 font-mono text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-[rgb(var(--muted))]">{hint}</p>
      </div>
    </Card>
  );
}
