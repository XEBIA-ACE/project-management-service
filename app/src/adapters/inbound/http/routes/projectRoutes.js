'use strict';

const { Router } = require('express');
const Joi = require('joi');
const { ValidationError } = require('../../../../domain/errors');

// ── Validation schemas ────────────────────────────────────────────────────────

const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(2000).optional().allow(''),
  ownerId: Joi.string().required(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(2000).optional().allow(''),
  status: Joi.string().valid('active', 'archived').optional(),
  version: Joi.number().integer().min(0).required(),
});

/**
 * Middleware factory: validate req.body against a Joi schema.
 *
 * @param {import('joi').Schema} schema
 * @returns {import('express').RequestHandler}
 */
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new ValidationError(message));
  }
  req.body = value;
  next();
};

/**
 * Build the projects router.
 *
 * @param {import('../../../../adapters/inbound/http/controllers/ProjectController')} controller
 * @param {import('../../../../domain/ports/AuthProvider')} authProvider
 * @returns {import('express').Router}
 */
const buildProjectRoutes = (controller, authProvider) => {
  const router = Router();

  // Auth middleware — verify Bearer JWT
  const authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'] || '';
      if (!authHeader.startsWith('Bearer ')) {
        const { UnauthorizedError } = require('../../../../domain/errors');
        throw new UnauthorizedError('Missing or malformed Authorization header');
      }
      const token = authHeader.slice(7);
      const payload = await authProvider.verifyToken(token);
      req.user = payload;
      next();
    } catch (err) {
      next(err);
    }
  };

  router.use(authenticate);

  router.get('/', (req, res, next) => controller.list(req, res, next));
  router.post('/', validateBody(createProjectSchema), (req, res, next) =>
    controller.create(req, res, next)
  );
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.put('/:id', validateBody(updateProjectSchema), (req, res, next) =>
    controller.update(req, res, next)
  );
  router.delete('/:id', (req, res, next) => controller.remove(req, res, next));

  return router;
};

module.exports = buildProjectRoutes;
