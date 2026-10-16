import { z } from "zod";
import { ServiceError } from "@/services/errors/service-error";

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  const timeout = AbortSignal.timeout(15000);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers,
      signal,
      credentials: "include",
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ServiceError(
      timeout.aborted
        ? "The request timed out. Please retry."
        : "The server could not be reached. Check your connection and retry.",
      "NETWORK",
    );
  }
  if (!response.ok)
    throw new ServiceError(
      response.status === 409
        ? "A newer version exists. Reload before editing."
        : `Request failed (${response.status}). Please retry.`,
      response.status === 409
        ? "CONFLICT"
        : response.status === 404
          ? "NOT_FOUND"
          : "NETWORK",
      response.status,
    );
  let data: unknown;
  try {
    data = response.status === 204 ? undefined : await response.json();
  } catch {
    throw new ServiceError(
      "The server returned an invalid response.",
      "VALIDATION",
    );
  }
  const result = schema.safeParse(data);
  if (!result.success)
    throw new ServiceError(
      "The server returned an invalid response.",
      "VALIDATION",
    );
  return result.data;
}
