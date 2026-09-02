'use strict';

process.env.NODE_ENV = 'test';
process.env.USE_IN_MEMORY_REPO = 'true';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ALGORITHM = 'HS256';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/app');
const InMemoryProjectRepository = require('../../src/infrastructure/repositories/InMemoryProjectRepository');

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeToken = (payload = {}) =>
  jwt.sign({ sub: 'user-1', roles: ['admin'], ...payload }, 'test-secret', {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Projects API', () => {
  let app;
  let repo;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    app = createApp({ projectRepository: repo });
  });

  afterEach(() => {
    repo.clear();
  });

  // ── Auth guard ──────────────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/projects');
      expect(res.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });

  // ── List ────────────────────────────────────────────────────────────────────

  describe('GET /api/v1/projects', () => {
    it('should return an empty list when no projects exist', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set(authHeader(makeToken()));

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return all projects', async () => {
      const token = makeToken();

      await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'Alpha', ownerId: 'user-1' });

      await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'Beta', ownerId: 'user-1' });

      const res = await request(app)
        .get('/api/v1/projects')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  describe('POST /api/v1/projects', () => {
    it('should create a project and return 201', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(makeToken()))
        .send({ name: 'My Project', ownerId: 'user-1', description: 'A test project' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('My Project');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.version).toBe(1);
    });

    it('should return 422 when name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(makeToken()))
        .send({ ownerId: 'user-1' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 when ownerId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(makeToken()))
        .send({ name: 'No Owner' });

      expect(res.status).toBe(422);
    });
  });

  // ── Get by ID ───────────────────────────────────────────────────────────────

  describe('GET /api/v1/projects/:id', () => {
    it('should return a project by ID', async () => {
      const token = makeToken();

      const createRes = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'Find Me', ownerId: 'user-1' });

      const { id } = createRes.body.data;

      const res = await request(app)
        .get(`/api/v1/projects/${id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(id);
      expect(res.body.data.name).toBe('Find Me');
    });

    it('should return 404 for a non-existent project', async () => {
      const res = await request(app)
        .get('/api/v1/projects/non-existent-id')
        .set(authHeader(makeToken()));

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  describe('PUT /api/v1/projects/:id', () => {
    it('should update a project', async () => {
      const token = makeToken();

      const createRes = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'Original', ownerId: 'user-1' });

      const { id, version } = createRes.body.data;

      const res = await request(app)
        .put(`/api/v1/projects/${id}`)
        .set(authHeader(token))
        .send({ name: 'Updated', version });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated');
      expect(res.body.data.version).toBe(version + 1);
    });

    it('should return 409 on version conflict', async () => {
      const token = makeToken();

      const createRes = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'Conflict Test', ownerId: 'user-1' });

      const { id } = createRes.body.data;

      const res = await request(app)
        .put(`/api/v1/projects/${id}`)
        .set(authHeader(token))
        .send({ name: 'Stale Update', version: 999 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should return 422 when version is missing', async () => {
      const token = makeToken();

      const createRes = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'No Version', ownerId: 'user-1' });

      const { id } = createRes.body.data;

      const res = await request(app)
        .put(`/api/v1/projects/${id}`)
        .set(authHeader(token))
        .send({ name: 'Missing Version' });

      expect(res.status).toBe(422);
    });
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete a project and return 204', async () => {
      const token = makeToken();

      const createRes = await request(app)
        .post('/api/v1/projects')
        .set(authHeader(token))
        .send({ name: 'To Delete', ownerId: 'user-1' });

      const { id } = createRes.body.data;

      const deleteRes = await request(app)
        .delete(`/api/v1/projects/${id}`)
        .set(authHeader(token));

      expect(deleteRes.status).toBe(204);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/v1/projects/${id}`)
        .set(authHeader(token));

      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent project', async () => {
      const res = await request(app)
        .delete('/api/v1/projects/ghost-id')
        .set(authHeader(makeToken()));

      expect(res.status).toBe(404);
    });
  });
});
