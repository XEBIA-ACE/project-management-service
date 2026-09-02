'use strict';

const { Pool } = require('pg');
const ProjectRepository = require('../../domain/ports/ProjectRepository');
const Project = require('../../domain/entities/Project');
const config = require('../../config');

/**
 * PostgresProjectRepository — production adapter for the ProjectRepository port.
 *
 * Uses pg Pool for connection management.
 * TODO: run migrations / schema creation before first use.
 */
class PostgresProjectRepository extends ProjectRepository {
  constructor() {
    super();
    this._pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      min: config.db.poolMin,
      max: config.db.poolMax,
    });
  }

  /**
   * Map a DB row to a Project entity.
   * @param {object} row
   * @returns {import('../../domain/entities/Project')}
   */
  _rowToProject(row) {
    return new Project({
      id: row.id,
      name: row.name,
      description: row.description,
      ownerId: row.owner_id,
      status: row.status,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async save(project) {
    const sql = `
      INSERT INTO projects (id, name, description, owner_id, status, version, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      project.id,
      project.name,
      project.description,
      project.ownerId,
      project.status,
      project.version,
      project.createdAt,
      project.updatedAt,
    ];
    const { rows } = await this._pool.query(sql, values);
    return this._rowToProject(rows[0]);
  }

  async findById(id) {
    const { rows } = await this._pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return rows.length ? this._rowToProject(rows[0]) : null;
  }

  async findAll(filters = {}) {
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const values = [];

    if (filters.ownerId) {
      values.push(filters.ownerId);
      sql += ` AND owner_id = $${values.length}`;
    }
    if (filters.status) {
      values.push(filters.status);
      sql += ` AND status = $${values.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await this._pool.query(sql, values);
    return rows.map((r) => this._rowToProject(r));
  }

  async update(project) {
    const sql = `
      UPDATE projects
      SET name = $1, description = $2, status = $3, version = $4, updated_at = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [
      project.name,
      project.description,
      project.status,
      project.version,
      project.updatedAt,
      project.id,
    ];
    const { rows } = await this._pool.query(sql, values);
    return this._rowToProject(rows[0]);
  }

  async delete(id) {
    await this._pool.query('DELETE FROM projects WHERE id = $1', [id]);
  }

  /** Close the connection pool (useful for graceful shutdown). */
  async close() {
    await this._pool.end();
  }
}

module.exports = PostgresProjectRepository;
