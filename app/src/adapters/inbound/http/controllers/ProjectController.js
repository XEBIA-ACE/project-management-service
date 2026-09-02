'use strict';

const logger = require('../../../../infrastructure/logger');

/**
 * ProjectController — inbound HTTP adapter.
 *
 * Translates HTTP requests into use-case calls and HTTP responses.
 * All business logic lives in the use-cases; this class only handles
 * HTTP concerns (parsing, status codes, response shaping).
 */
class ProjectController {
  /**
   * @param {object} usecases
   * @param {import('../../../../domain/usecases/CreateProject')} usecases.createProject
   * @param {import('../../../../domain/usecases/GetProject')}    usecases.getProject
   * @param {import('../../../../domain/usecases/ListProjects')}  usecases.listProjects
   * @param {import('../../../../domain/usecases/UpdateProject')} usecases.updateProject
   * @param {import('../../../../domain/usecases/DeleteProject')} usecases.deleteProject
   */
  constructor({ createProject, getProject, listProjects, updateProject, deleteProject }) {
    this.createProject = createProject;
    this.getProject = getProject;
    this.listProjects = listProjects;
    this.updateProject = updateProject;
    this.deleteProject = deleteProject;
  }

  /**
   * GET /api/v1/projects
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async list(req, res, next) {
    try {
      const filters = {};
      if (req.query.ownerId) filters.ownerId = req.query.ownerId;
      if (req.query.status) filters.status = req.query.status;

      const projects = await this.listProjects.execute(filters);
      res.status(200).json({ data: projects });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async create(req, res, next) {
    try {
      const project = await this.createProject.execute(req.body);
      logger.info('Project created', { projectId: project.id, userId: req.user?.sub });
      res.status(201).json({ data: project });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/:id
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getById(req, res, next) {
    try {
      const project = await this.getProject.execute(req.params.id);
      res.status(200).json({ data: project });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/projects/:id
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async update(req, res, next) {
    try {
      const project = await this.updateProject.execute(req.params.id, req.body);
      logger.info('Project updated', { projectId: project.id, userId: req.user?.sub });
      res.status(200).json({ data: project });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async remove(req, res, next) {
    try {
      await this.deleteProject.execute(req.params.id);
      logger.info('Project deleted', { projectId: req.params.id, userId: req.user?.sub });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProjectController;
