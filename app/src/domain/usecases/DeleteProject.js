'use strict';

const { NotFoundError } = require('../errors');

/**
 * DeleteProject use-case.
 *
 * Verifies the project exists before removing it.
 */
class DeleteProject {
  /**
   * @param {import('../ports/ProjectRepository')} projectRepository
   */
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async execute(id) {
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Project with id '${id}' not found`);
    }
    await this.projectRepository.delete(id);
  }
}

module.exports = DeleteProject;
