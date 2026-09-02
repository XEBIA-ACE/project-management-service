'use strict';

/**
 * ListProjects use-case.
 *
 * Returns all projects, with optional filtering.
 */
class ListProjects {
  /**
   * @param {import('../ports/ProjectRepository')} projectRepository
   */
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * @param {object} [filters]
   * @param {string} [filters.ownerId]
   * @param {string} [filters.status]
   * @returns {Promise<import('../entities/Project')[]>}
   */
  async execute(filters = {}) {
    return this.projectRepository.findAll(filters);
  }
}

module.exports = ListProjects;
