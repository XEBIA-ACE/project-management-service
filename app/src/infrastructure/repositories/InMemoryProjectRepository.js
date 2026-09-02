'use strict';

const ProjectRepository = require('../../domain/ports/ProjectRepository');
const Project = require('../../domain/entities/Project');

/**
 * InMemoryProjectRepository — adapter for the ProjectRepository port.
 *
 * Suitable for development, testing, and when USE_IN_MEMORY_REPO=true.
 */
class InMemoryProjectRepository extends ProjectRepository {
  constructor() {
    super();
    /** @type {Map<string, import('../../domain/entities/Project')>} */
    this._store = new Map();
  }

  /**
   * @param {import('../../domain/entities/Project')} project
   * @returns {Promise<import('../../domain/entities/Project')>}
   */
  async save(project) {
    this._store.set(project.id, project);
    return project;
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../../domain/entities/Project')|null>}
   */
  async findById(id) {
    return this._store.get(id) || null;
  }

  /**
   * @param {object} [filters]
   * @param {string} [filters.ownerId]
   * @param {string} [filters.status]
   * @returns {Promise<import('../../domain/entities/Project')[]>}
   */
  async findAll(filters = {}) {
    let results = Array.from(this._store.values());

    if (filters.ownerId) {
      results = results.filter((p) => p.ownerId === filters.ownerId);
    }
    if (filters.status) {
      results = results.filter((p) => p.status === filters.status);
    }

    return results;
  }

  /**
   * @param {import('../../domain/entities/Project')} project
   * @returns {Promise<import('../../domain/entities/Project')>}
   */
  async update(project) {
    this._store.set(project.id, project);
    return project;
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    this._store.delete(id);
  }

  /** Utility for tests — wipe all records. */
  clear() {
    this._store.clear();
  }
}

module.exports = InMemoryProjectRepository;
