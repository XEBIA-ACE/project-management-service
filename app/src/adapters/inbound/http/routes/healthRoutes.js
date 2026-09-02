'use strict';

const { Router } = require('express');
const os = require('os');

const router = Router();

/**
 * GET /health
 * Liveness probe — no auth required.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'project-management-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hostname: os.hostname(),
  });
});

/**
 * GET /health/ready
 * Readiness probe — can be extended to check DB connectivity.
 */
router.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
