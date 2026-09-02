'use strict';

const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../../../domain/errors');
const config = require('../../../config');

/**
 * Middleware: verify Bearer JWT and attach decoded payload to req.user.
 *
 * In test / development mode with USE_IN_MEMORY_REPO=true and no JWKS_URI
 * configured, a simple HS256 shared-secret verification is used.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);

    // Simple HS256 path (dev / test)
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: [config.jwtAlgorithm],
    });

    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'UnauthorizedError') return next(err);
    next(new UnauthorizedError(`Token verification failed: ${err.message}`));
  }
};

/**
 * Middleware factory: require at least one of the given roles.
 *
 * Roles are read from req.user.roles (array) or req.user.role (string).
 *
 * @param {...string} roles
 * @returns {import('express').RequestHandler}
 */
const requireRoles = (...roles) => (req, res, next) => {
  const userRoles = Array.isArray(req.user?.roles)
    ? req.user.roles
    : req.user?.role
    ? [req.user.role]
    : [];

  const hasRole = roles.some((r) => userRoles.includes(r));
  if (!hasRole) {
    return next(
      new ForbiddenError(
        `Access denied. Required roles: [${roles.join(', ')}]`
      )
    );
  }
  next();
};

module.exports = { authenticate, requireRoles };
