'use strict';

const client = require('prom-client');

// Enable default Node.js metrics (event loop lag, memory, etc.)
client.collectDefaultMetrics({ prefix: 'pms_' });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'pms_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const httpRequestTotal = new client.Counter({
  name: 'pms_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

/**
 * Express middleware that records request duration and count.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    };
    end(labels);
    httpRequestTotal.inc(labels);
  });

  next();
};

module.exports = { client, metricsMiddleware };
