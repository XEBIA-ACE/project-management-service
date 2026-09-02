'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  validateBody,
  createProjectSchema,
  updateProjectSchema,
} = require('../middleware/validation');

/**
 * Build the projects router, injecting use-case instances.
 *
 * @param {object} useCases
 * @param {import('../../../domain/usecases/CreateProject')} useCases.createProject
 * @param {import('../../../domain/usecases/GetProject')}    useCases.getProject
 * @param {import('../../../domain/usecases/ListProjects')}  useCases.listProjects
 * @param {import('../../../domain/usecases/UpdateProject')} useCases.updateProject
 * @param {import('../../../domain/usecases/DeleteProject')} useCases.deleteProject
 * @returns {import('express').Router}
 */
const buildProjectsRouter = ({
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
}) => {
  const router = Router();

  // All project endpoints require authentication
  router.use(authenticate);

  /**
   * GET /projects
   * List all projects (optionally filtered by ownerId or status query params).
   */
  router.get('/', async (req, res, next) => {
    try {
      const filters = {};
      if (req.query.ownerId) filters.ownerId = req.query.ownerId;
      if (req.query.status) filters.status = req.query.status;

      const projects = await listProjects.execute(filters);
      res.status(200).json({ data: projects });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /projects
   * Create a new project.
   */
  router.post('/', validateBody(createProjectSchema), async (req, res, next) => {
    try {
      const project = await createProject.execute(req.body);
      res.status(201).json({ data: project });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /projects/:id
   * Retrieve a single project by ID.
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const project = await getProject.execute(req.params.id);
      res.status(200).json({ data: project });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PUT /projects/:id
   * Update a project (optimistic concurrency — version required in body).
   */
  router.put(
    '/:id',
    validateBody(updateProjectSchema),
    async (req, res, next) => {
      try {
        const project = await updateProject.execute(req.params.id, req.body);
        res.status(200).json({ data: project });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * DELETE /projects/:id
   * Delete a project.
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      await deleteProject.execute(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};

module.exports = buildProjectsRouter;
