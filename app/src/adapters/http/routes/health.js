'use strict';

const { Router } = require('express');
const os = require('os');

const router = Router();

/**
 * GET /health
 *
 * Returns service liveness information.
 * No authentication required — used by load balancers and container orchestrators.
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

module.exports = router;
