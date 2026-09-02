'use strict';

require('dotenv').config();

const app = require('./app');
const config = require('./config');
const logger = require('./infrastructure/logger');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Project Management Service started`, {
    port: PORT,
    env: config.nodeEnv,
  });
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully…`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10 s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server; // exported for testing
