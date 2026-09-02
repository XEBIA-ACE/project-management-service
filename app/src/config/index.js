'use strict';

/**
 * Centralised environment configuration.
 * All process.env reads happen here so the rest of the codebase
 * never touches process.env directly.
 */
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Auth
  jwksUri: process.env.JWKS_URI || '',
  jwtAudience: process.env.JWT_AUDIENCE || 'project-management-service',
  jwtIssuer: process.env.JWT_ISSUER || '',
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'project_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  useInMemoryRepo: process.env.USE_IN_MEMORY_REPO === 'true',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = config;
