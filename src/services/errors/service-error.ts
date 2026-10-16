export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "STORAGE"
      | "CONFLICT"
      | "VALIDATION"
      | "NETWORK"
      | "ABORTED",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
