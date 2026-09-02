'use strict';

const {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} = require('../../../domain/errors');
const logger = require('../../../infrastructure/logger');

/**
 * Central Express error-handling middleware.
 *
 * Maps domain errors to appropriate HTTP status codes and returns a
 * consistent JSON error envelope.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let status = 500;
  let code = 'INTERNAL_SERVER_ERROR';

  if (err instanceof UnauthorizedError) {
    status = 401;
    code = 'UNAUTHORIZED';
  } else if (err instanceof ForbiddenError) {
    status = 403;
    code = 'FORBIDDEN';
  } else if (err instanceof NotFoundError) {
    status = 404;
    code = 'NOT_FOUND';
  } else if (err instanceof ValidationError) {
    status = 422;
    code = 'VALIDATION_ERROR';
  } else if (err instanceof ConflictError) {
    status = 409;
    code = 'CONFLICT';
  }

  if (status === 500) {
    logger.error('Unhandled error', { err });
  } else {
    logger.warn('Client error', { code, message: err.message });
  }

  res.status(status).json({
    error: {
      code,
      message: err.message,
    },
  });
};

module.exports = errorHandler;
