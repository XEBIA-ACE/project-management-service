'use strict';

const { NotFoundError, ConflictError } = require('../errors');

/**
 * UpdateProject use-case.
 *
 * Applies optimistic concurrency control: the caller must supply the
 * current `version` of the project. If the stored version differs,
 * a ConflictError is thrown.
 */
class UpdateProject {
  /**
   * @param {import('../ports/ProjectRepository')} projectRepository
   */
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * @param {string} id
   * @param {object} updates
   * @param {string} [updates.name]
   * @param {string} [updates.description]
   * @param {'active'|'archived'} [updates.status]
   * @param {number} updates.version  — expected current version (optimistic lock)
   * @returns {Promise<import('../entities/Project')>}
   */
  async execute(id, updates) {
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Project with id '${id}' not found`);
    }

    if (updates.version !== undefined && existing.version !== updates.version) {
      throw new ConflictError(
        `Optimistic concurrency conflict: expected version ${updates.version}, ` +
          `but current version is ${existing.version}`
      );
    }

    const updated = existing.applyUpdate(updates);
    return this.projectRepository.update(updated);
  }
}

module.exports = UpdateProject;
