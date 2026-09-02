'use strict';

/**
 * ProjectRepository — outbound port (interface / abstract class).
 *
 * All persistence adapters must implement these methods.
 * Throw `NotImplementedError` from the base class to catch missing implementations early.
 */
class ProjectRepository {
  /**
   * Persist a new project.
   *
   * @param {import('../entities/Project')} project
   * @returns {Promise<import('../entities/Project')>}
   */
  // eslint-disable-next-line no-unused-vars
  async save(project) {
    throw new Error('ProjectRepository.save() not implemented');
  }

  /**
   * Find a project by its unique identifier.
   *
   * @param {string} id
   * @returns {Promise<import('../entities/Project')|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    throw new Error('ProjectRepository.findById() not implemented');
  }

  /**
   * Return all projects, optionally filtered.
   *
   * @param {object} [filters]
   * @param {string} [filters.ownerId]
   * @param {string} [filters.status]
   * @returns {Promise<import('../entities/Project')[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async findAll(filters = {}) {
    throw new Error('ProjectRepository.findAll() not implemented');
  }

  /**
   * Replace an existing project record.
   *
   * @param {import('../entities/Project')} project
   * @returns {Promise<import('../entities/Project')>}
   */
  // eslint-disable-next-line no-unused-vars
  async update(project) {
    throw new Error('ProjectRepository.update() not implemented');
  }

  /**
   * Remove a project by ID.
   *
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async delete(id) {
    throw new Error('ProjectRepository.delete() not implemented');
  }
}

module.exports = ProjectRepository;
