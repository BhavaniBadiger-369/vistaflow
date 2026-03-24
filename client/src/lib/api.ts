"use client";

import axios, { type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/store/auth-store";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const requestUrl = String(originalRequest?.url ?? "");
    const shouldSkipRefresh =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= api.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });

        await refreshPromise;

        return api(originalRequest);
      } catch {
        useAuthStore.getState().clear();
      }
    }

    return Promise.reject(error);
  },
);
