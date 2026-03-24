"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import type { SearchResponse } from "@vistaflow/shared";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    let active = true;
    setLoading(true);

    const load = async () => {
      try {
        const { data } = await api.get("/search", {
          params: { q: deferredQuery, limit: 5 },
        });

        if (!active) {
          return;
        }

        startTransition(() => {
          setResults(data.data);
        });
      } catch {
        if (active) {
          setResults(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [deferredQuery]);

  const hasResults =
    Boolean(results?.projects.length) || Boolean(results?.tasks.length);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="pl-10"
        placeholder="Search projects or tasks"
      />
      {(loading || hasResults) && query.trim().length >= 2 ? (
        <Card className="absolute left-0 right-0 top-[calc(100%+12px)] z-40 rounded-[26px] p-3">
          {loading ? (
            <p className="px-2 py-3 text-sm text-[rgb(var(--muted))]">
              Searching...
            </p>
          ) : (
            <div className="space-y-3">
              {results?.projects.length ? (
                <div>
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                    Projects
                  </p>
                  <div className="mt-2 space-y-1">
                    {results.projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        className="w-full rounded-2xl px-3 py-2 text-left hover:bg-[rgba(var(--surface-alt),0.72)]"
                        onClick={() => {
                          setQuery("");
                          setResults(null);
                          router.push("/projects");
                        }}
                      >
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-[rgb(var(--muted))]">
                          {project.status}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {results?.tasks.length ? (
                <div>
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                    Tasks
                  </p>
                  <div className="mt-2 space-y-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className="w-full rounded-2xl px-3 py-2 text-left hover:bg-[rgba(var(--surface-alt),0.72)]"
                        onClick={() => {
                          setQuery("");
                          setResults(null);
                          router.push("/tasks");
                        }}
                      >
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-[rgb(var(--muted))]">
                          {task.status}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
