'use strict';

const ProjectRepository = require('../../../../domain/ports/ProjectRepository');
const Project = require('../../../../domain/entities/Project');

/**
 * InMemoryProjectRepository — outbound persistence adapter.
 *
 * Implements the ProjectRepository port using a plain in-memory Map.
 * Suitable for development, testing, and when USE_IN_MEMORY_REPO=true.
 */
class InMemoryProjectRepository extends ProjectRepository {
  constructor() {
    super();
    /** @type {Map<string, Project>} */
    this._store = new Map();
  }

  /**
   * @param {Project} project
   * @returns {Promise<Project>}
   */
  async save(project) {
    this._store.set(project.id, project);
    return project;
  }

  /**
   * @param {string} id
   * @returns {Promise<Project|null>}
   */
  async findById(id) {
    return this._store.get(id) || null;
  }

  /**
   * @param {object} [filters]
   * @param {string} [filters.ownerId]
   * @param {string} [filters.status]
   * @returns {Promise<Project[]>}
   */
  async findAll(filters = {}) {
    let results = Array.from(this._store.values());
    if (filters.ownerId) results = results.filter((p) => p.ownerId === filters.ownerId);
    if (filters.status) results = results.filter((p) => p.status === filters.status);
    return results;
  }

  /**
   * @param {Project} project
   * @returns {Promise<Project>}
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
