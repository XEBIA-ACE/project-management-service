'use strict';

const winston = require('winston');
const config = require('../../config');

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.nodeEnv === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} [${level}]: ${message}${
                Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
              }`
          )
        )
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
