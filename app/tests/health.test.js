'use strict';

process.env.NODE_ENV = 'test';
process.env.USE_IN_MEMORY_REPO = 'true';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ALGORITHM = 'HS256';

const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Health Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should include service name', async () => {
      const res = await request(app).get('/health');

      expect(res.body.service).toBe('project-management-service');
    });

    it('should include a timestamp', async () => {
      const res = await request(app).get('/health');

      expect(res.body.timestamp).toBeDefined();
      expect(() => new Date(res.body.timestamp)).not.toThrow();
    });

    it('should include uptime as a number', async () => {
      const res = await request(app).get('/health');

      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return JSON content-type', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
