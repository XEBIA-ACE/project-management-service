'use strict';

const Joi = require('joi');
const { ValidationError } = require('../../../domain/errors');

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

// ── Schemas ──────────────────────────────────────────────────────────────────

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

module.exports = {
  validateBody,
  createProjectSchema,
  updateProjectSchema,
};
