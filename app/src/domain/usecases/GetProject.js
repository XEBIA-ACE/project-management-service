'use strict';

const { NotFoundError } = require('../errors');

/**
 * GetProject use-case.
 *
 * Retrieves a single project by ID.
 */
class GetProject {
  /**
   * @param {import('../ports/ProjectRepository')} projectRepository
   */
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../entities/Project')>}
   */
  async execute(id) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError(`Project with id '${id}' not found`);
    }
    return project;
  }
}

module.exports = GetProject;
