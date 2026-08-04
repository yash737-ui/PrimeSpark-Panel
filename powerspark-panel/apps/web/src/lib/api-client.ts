import type { ApiErrorResponse } from "@powerspark/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Thin fetch wrapper for the PowerSpark Panel API.
 * - Always sends credentials so the httpOnly refresh-token cookie works.
 * - Normalizes non-2xx responses into a typed ApiError.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse | null;
    throw new ApiError(response.status, errorBody?.message ?? "Something went wrong", errorBody?.errors);
  }

  return body as T;
}
