/**
 * Base class for all domain errors. Keeps the domain layer decoupled from
 * any framework (NestJS, Express, etc.). The global DomainExceptionFilter
 * maps these to HTTP responses.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Restores correct instanceof checks after TypeScript transpilation
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Maps to HTTP 400 Bad Request */
export class ValidationError extends DomainError {}

/** Maps to HTTP 404 Not Found */
export class NotFoundError extends DomainError {}

/** Maps to HTTP 409 Conflict */
export class ConflictError extends DomainError {}

/** Maps to HTTP 403 Forbidden */
export class ForbiddenError extends DomainError {}

/** Maps to HTTP 401 Unauthorized */
export class UnauthorizedError extends DomainError {}
