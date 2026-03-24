"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const demoAccounts = [
  { label: "Admin", email: "admin@vistaflow.com", password: "Admin@123" },
  { label: "Manager", email: "manager@vistaflow.com", password: "Manager@123" },
  { label: "Member", email: "member@vistaflow.com", password: "Member@123" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 lg:px-10">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
                VistaFlow
              </p>
              <p className="text-xs text-[rgb(var(--muted))]">
                Team & Project Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Create account</Button>
            </Link>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="grid flex-1 items-center gap-16 py-16 lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="space-y-8 max-w-xl">
            <Badge className="inline-flex items-center rounded-full bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] px-4 py-1 text-xs font-medium">
              {" "}
              Project & Task Management
            </Badge>

            <div className="space-y-5">
              <h1 className="font-mono text-4xl font-semibold leading-tight lg:text-5xl">
                Manage teams, projects, and tasks in one place
              </h1>

              <p className="text-lg leading-8 text-[rgb(var(--muted))]">
                A simple system to organize work, assign tasks, and track
                progress across teams with role-based access.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <Link href="/login">
                <Button className="px-5 py-3">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* FEATURES */}
            <div className="grid gap-6 pt-6 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Authentication",
                  desc: "Secure login with role-based access",
                },
                {
                  icon: Workflow,
                  title: "Project Structure",
                  desc: "Projects → Sections → Tasks hierarchy",
                },
                {
                  icon: CheckCircle2,
                  title: "Task Tracking",
                  desc: "Assign, update and track progress",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(var(--primary),0.12)]">
                    <item.icon className="h-5 w-5 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-[rgb(var(--muted))]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE (DEMO ACCOUNTS) */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md space-y-5 rounded-[28px] p-6 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  Demo Access
                </p>
                <h3 className="mt-2 text-xl font-semibold">Login with roles</h3>
              </div>

              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <div
                    key={account.email}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3 hover:bg-[rgba(var(--muted),0.08)] transition"
                  >
                    <div>
                      <p className="font-medium">{account.label}</p>
                      <p className="text-xs text-[rgb(var(--muted))]">
                        {account.email}
                      </p>
                    </div>

                    <span className="text-xs font-mono text-[rgb(var(--muted))]">
                      {account.password}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
