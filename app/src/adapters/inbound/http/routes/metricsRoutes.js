'use strict';

const { Router } = require('express');
const { client } = require('../../../../infrastructure/metrics');

const router = Router();

/**
 * GET /metrics
 * Prometheus-compatible metrics endpoint.
 * In production, restrict access to internal network only.
 */
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', client.contentType);
    res.end(await client.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

module.exports = router;
