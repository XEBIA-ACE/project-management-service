'use strict';

const Project = require('../entities/Project');

/**
 * CreateProject use-case.
 *
 * Validates input, constructs a Project entity, and persists it.
 */
class CreateProject {
  /**
   * @param {import('../ports/ProjectRepository')} projectRepository
   */
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * @param {object} params
   * @param {string} params.name
   * @param {string} [params.description]
   * @param {string} params.ownerId
   * @returns {Promise<import('../entities/Project')>}
   */
  async execute({ name, description, ownerId }) {
    const project = new Project({ name, description, ownerId });
    return this.projectRepository.save(project);
  }
}

module.exports = CreateProject;
