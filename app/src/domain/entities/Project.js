'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Project domain entity.
 *
 * Encapsulates all business rules and invariants for a project.
 */
class Project {
  /**
   * @param {object} params
   * @param {string} [params.id]
   * @param {string} params.name
   * @param {string} [params.description]
   * @param {string} params.ownerId
   * @param {'active'|'archived'|'deleted'} [params.status]
   * @param {number} [params.version]
   * @param {Date} [params.createdAt]
   * @param {Date} [params.updatedAt]
   */
  constructor({
    id,
    name,
    description = '',
    ownerId,
    status = 'active',
    version = 1,
    createdAt,
    updatedAt,
  }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Project name is required');
    }
    if (!ownerId || typeof ownerId !== 'string') {
      throw new Error('Project ownerId is required');
    }

    this.id = id || uuidv4();
    this.name = name.trim();
    this.description = description;
    this.ownerId = ownerId;
    this.status = status;
    this.version = version;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Apply an update payload and increment the version.
   *
   * @param {object} updates
   * @param {string} [updates.name]
   * @param {string} [updates.description]
   * @param {'active'|'archived'} [updates.status]
   * @returns {Project} new Project instance (immutable update)
   */
  applyUpdate(updates) {
    return new Project({
      ...this,
      name: updates.name !== undefined ? updates.name : this.name,
      description:
        updates.description !== undefined ? updates.description : this.description,
      status: updates.status !== undefined ? updates.status : this.status,
      version: this.version + 1,
      updatedAt: new Date(),
    });
  }

  /**
   * Serialise to a plain object (safe for JSON responses).
   *
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      status: this.status,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Project;
