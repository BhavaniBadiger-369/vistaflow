"use client";

import { useEffect } from "react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (initialized) {
      return;
    }

    let active = true;

    const hydrate = async () => {
      try {
        const { data } = await api.get("/auth/me");

        if (!active) {
          return;
        }

        setUser(data.user);
      } catch {
        if (!active) {
          return;
        }

        setUser(null);
      } finally {
        if (!active) {
          return;
        }

        setLoading(false);
        setInitialized(true);
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [initialized, setInitialized, setLoading, setUser]);

  return children;
}
