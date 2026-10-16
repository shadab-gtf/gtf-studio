/**
 * The single HTTP seam of the app: same-origin JSON over fetch with session cookies and CSRF.
 * Every failure surfaces as an `ApiError` so UI code never inspects raw Responses.
 */
export const API_BASE = '/api/v1'

export type QueryValue = string | number | boolean | null | undefined

export interface ApiErrorInit {
  status: number
  code: string
  message: string
  fields?: Record<string, string[] | string>
  fieldCodes?: Record<string, string[] | string>
  /** Seconds the server asks the client to wait (429). */
  retryAfter?: number
  data?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Field-level validation messages, always normalised to string arrays. */
  readonly fields: Record<string, string[]>
  /** Machine-readable codes per field, normalised to string arrays. */
  readonly fieldCodes: Record<string, string[]>
  /** Seconds to wait before retrying, when the server said so (429). */
  readonly retryAfter: number | null
  /** The parsed error body (e.g. `{current}` on a revision conflict). */
  readonly data: unknown

  constructor({ status, code, message, fields, fieldCodes, retryAfter, data }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
    const normalise = (input: Record<string, string[] | string> | undefined): Record<string, string[]> =>
      Object.fromEntries(Object.entries(input ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value : [value]]))
    this.fields = normalise(fields)
    this.fieldCodes = normalise(fieldCodes)
    this.retryAfter = typeof retryAfter === 'number' && Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter) : null
  }

  get isNetwork(): boolean {
    return this.code === 'network_error'
  }
  get isUnauthorized(): boolean {
    return this.status === 401
  }
  get isNotFound(): boolean {
    return this.status === 404
  }
  get isConflict(): boolean {
    return this.status === 409
  }
  get isRateLimited(): boolean {
    return this.status === 429
  }

  /** First message for a field, if any. */
  fieldError(name: string): string | undefined {
    return this.fields[name]?.[0]
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

