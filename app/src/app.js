'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./infrastructure/logger');
const { metricsMiddleware } = require('./infrastructure/metrics');

// Routes
const healthRouter = require('./adapters/http/routes/health');
const metricsRouter = require('./adapters/http/routes/metrics');
const buildProjectsRouter = require('./adapters/http/routes/projects');

// Error handler
const errorHandler = require('./adapters/http/middleware/errorHandler');

// Repositories & providers
const InMemoryProjectRepository = require('./infrastructure/repositories/InMemoryProjectRepository');
const PostgresProjectRepository = require('./infrastructure/repositories/PostgresProjectRepository');

// Use-cases
const CreateProject = require('./domain/usecases/CreateProject');
const GetProject = require('./domain/usecases/GetProject');
const ListProjects = require('./domain/usecases/ListProjects');
const UpdateProject = require('./domain/usecases/UpdateProject');
const DeleteProject = require('./domain/usecases/DeleteProject');

/**
 * Factory function — creates and configures the Express application.
 * Accepts optional overrides for dependency injection in tests.
 *
 * @param {object} [overrides]
 * @param {import('./domain/ports/ProjectRepository')} [overrides.projectRepository]
 * @returns {express.Application}
 */
function createApp(overrides = {}) {
  const app = express();

  // ── Security & parsing ────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  if (config.nodeEnv !== 'test') {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
    );
  }

  // ── Prometheus metrics middleware ─────────────────────────────────────────
  app.use(metricsMiddleware);

  // ── Rate limiting ─────────────────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ── Dependency wiring ─────────────────────────────────────────────────────
  const projectRepository =
    overrides.projectRepository ||
    (config.useInMemoryRepo
      ? new InMemoryProjectRepository()
      : new PostgresProjectRepository());

  const usecases = {
    createProject: new CreateProject(projectRepository),
    getProject: new GetProject(projectRepository),
    listProjects: new ListProjects(projectRepository),
    updateProject: new UpdateProject(projectRepository),
    deleteProject: new DeleteProject(projectRepository),
  };

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/health', healthRouter);
  app.use('/metrics', metricsRouter);
  app.use('/api/v1/projects', buildProjectsRouter(usecases));

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // ── Global error handler ──────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
