'use strict';

const config = require('../config');

// Repositories
const InMemoryProjectRepository = require('../infrastructure/repositories/InMemoryProjectRepository');
const PostgresProjectRepository = require('../infrastructure/repositories/PostgresProjectRepository');

// Use-cases
const CreateProject = require('../domain/usecases/CreateProject');
const GetProject = require('../domain/usecases/GetProject');
const ListProjects = require('../domain/usecases/ListProjects');
const UpdateProject = require('../domain/usecases/UpdateProject');
const DeleteProject = require('../domain/usecases/DeleteProject');

/**
 * Composition root — wire up all dependencies.
 *
 * Returns an object containing all use-case instances ready for injection
 * into the HTTP adapters.
 *
 * @returns {{ projectRepository, createProject, getProject, listProjects, updateProject, deleteProject }}
 */
const compose = () => {
  // Select repository adapter based on configuration
  const projectRepository = config.useInMemoryRepo
    ? new InMemoryProjectRepository()
    : new PostgresProjectRepository();

  const createProject = new CreateProject(projectRepository);
  const getProject = new GetProject(projectRepository);
  const listProjects = new ListProjects(projectRepository);
  const updateProject = new UpdateProject(projectRepository);
  const deleteProject = new DeleteProject(projectRepository);

  return {
    projectRepository,
    createProject,
    getProject,
    listProjects,
    updateProject,
    deleteProject,
  };
};

module.exports = compose;
