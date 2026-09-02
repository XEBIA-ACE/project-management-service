'use strict';

/**
 * Domain error types.
 *
 * Using named subclasses lets middleware map errors to HTTP status codes
 * without coupling the domain to HTTP.
 */

class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends DomainError {}
class ValidationError extends DomainError {}
class ConflictError extends DomainError {}
class ForbiddenError extends DomainError {}
class UnauthorizedError extends DomainError {}

module.exports = {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
};
