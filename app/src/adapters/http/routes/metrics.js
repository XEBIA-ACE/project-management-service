'use strict';

const { Router } = require('express');
const { client } = require('../../../infrastructure/metrics');

const router = Router();

/**
 * GET /metrics
 *
 * Exposes Prometheus-compatible metrics.
 * Should be protected or only accessible from within the cluster in production.
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
