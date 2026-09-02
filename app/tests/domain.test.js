'use strict';

const Project = require('../../src/domain/entities/Project');
const CreateProject = require('../../src/domain/usecases/CreateProject');
const GetProject = require('../../src/domain/usecases/GetProject');
const ListProjects = require('../../src/domain/usecases/ListProjects');
const UpdateProject = require('../../src/domain/usecases/UpdateProject');
const DeleteProject = require('../../src/domain/usecases/DeleteProject');
const InMemoryProjectRepository = require('../../src/infrastructure/repositories/InMemoryProjectRepository');
const { NotFoundError, ConflictError } = require('../../src/domain/errors');

describe('Domain Use-Cases', () => {
  let repo;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
  });

  // ── Project entity ──────────────────────────────────────────────────────────

  describe('Project entity', () => {
    it('should create a project with defaults', () => {
      const p = new Project({ name: 'Test', ownerId: 'u1' });
      expect(p.id).toBeDefined();
      expect(p.status).toBe('active');
      expect(p.version).toBe(1);
    });

    it('should throw when name is empty', () => {
      expect(() => new Project({ name: '', ownerId: 'u1' })).toThrow();
    });

    it('should throw when ownerId is missing', () => {
      expect(() => new Project({ name: 'X' })).toThrow();
    });

    it('applyUpdate should return a new instance with incremented version', () => {
      const p = new Project({ name: 'Old', ownerId: 'u1' });
      const updated = p.applyUpdate({ name: 'New' });
      expect(updated.name).toBe('New');
      expect(updated.version).toBe(p.version + 1);
      expect(updated).not.toBe(p); // immutable
    });
  });

  // ── CreateProject ───────────────────────────────────────────────────────────

  describe('CreateProject', () => {
    it('should save and return a project', async () => {
      const uc = new CreateProject(repo);
      const project = await uc.execute({ name: 'Alpha', ownerId: 'u1' });

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Alpha');
    });
  });

  // ── GetProject ──────────────────────────────────────────────────────────────

  describe('GetProject', () => {
    it('should return an existing project', async () => {
      const created = await new CreateProject(repo).execute({ name: 'Beta', ownerId: 'u1' });
      const found = await new GetProject(repo).execute(created.id);
      expect(found.id).toBe(created.id);
    });

    it('should throw NotFoundError for unknown id', async () => {
      await expect(new GetProject(repo).execute('unknown')).rejects.toThrow(NotFoundError);
    });
  });

  // ── ListProjects ────────────────────────────────────────────────────────────

  describe('ListProjects', () => {
    it('should return all projects', async () => {
      const create = new CreateProject(repo);
      await create.execute({ name: 'P1', ownerId: 'u1' });
      await create.execute({ name: 'P2', ownerId: 'u2' });

      const list = await new ListProjects(repo).execute();
      expect(list).toHaveLength(2);
    });

    it('should filter by ownerId', async () => {
      const create = new CreateProject(repo);
      await create.execute({ name: 'P1', ownerId: 'u1' });
      await create.execute({ name: 'P2', ownerId: 'u2' });

      const list = await new ListProjects(repo).execute({ ownerId: 'u1' });
      expect(list).toHaveLength(1);
      expect(list[0].ownerId).toBe('u1');
    });
  });

  // ── UpdateProject ───────────────────────────────────────────────────────────

  describe('UpdateProject', () => {
    it('should update a project', async () => {
      const created = await new CreateProject(repo).execute({ name: 'Old', ownerId: 'u1' });
      const updated = await new UpdateProject(repo).execute(created.id, {
        name: 'New',
        version: created.version,
      });
      expect(updated.name).toBe('New');
      expect(updated.version).toBe(created.version + 1);
    });

    it('should throw ConflictError on version mismatch', async () => {
      const created = await new CreateProject(repo).execute({ name: 'Conflict', ownerId: 'u1' });
      await expect(
        new UpdateProject(repo).execute(created.id, { name: 'X', version: 999 })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError for unknown id', async () => {
      await expect(
        new UpdateProject(repo).execute('ghost', { name: 'X', version: 1 })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── DeleteProject ───────────────────────────────────────────────────────────

  describe('DeleteProject', () => {
    it('should delete an existing project', async () => {
      const created = await new CreateProject(repo).execute({ name: 'Del', ownerId: 'u1' });
      await new DeleteProject(repo).execute(created.id);
      await expect(new GetProject(repo).execute(created.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for unknown id', async () => {
      await expect(new DeleteProject(repo).execute('ghost')).rejects.toThrow(NotFoundError);
    });
  });
});
