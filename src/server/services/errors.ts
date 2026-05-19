export type ServiceErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "UNAUTHENTICATED"
  | "PLAN_REQUIRED"
  | "RATE_LIMITED";

const STATUS: Record<ServiceErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  FORBIDDEN: 403,
  UNAUTHENTICATED: 401,
  PLAN_REQUIRED: 402,
  RATE_LIMITED: 429,
}

export class ServiceError extends Error {
  readonly code: ServiceErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ServiceErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = "ServiceError"
    this.code = code
    this.status = STATUS[code]
    this.details = details
  }
}
