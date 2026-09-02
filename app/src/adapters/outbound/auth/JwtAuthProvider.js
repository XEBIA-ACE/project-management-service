'use strict';

const jwt = require('jsonwebtoken');
const AuthProvider = require('../../../../domain/ports/AuthProvider');
const config = require('../../../../config');

/**
 * JwtAuthProvider — outbound auth adapter.
 *
 * Implements the AuthProvider port using jsonwebtoken.
 *
 * Development / test: HS256 with JWT_SECRET.
 * Production: configure JWKS_URI + RS256 (extend verifyToken to use jwks-rsa).
 */
class JwtAuthProvider extends AuthProvider {
  /**
   * Verify a raw JWT string and return the decoded payload.
   *
   * @param {string} token
   * @returns {Promise<object>}
   */
  async verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        config.jwtSecret,
        { algorithms: [config.jwtAlgorithm] },
        (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        }
      );
    });
  }

  /**
   * Extract roles from a decoded JWT payload.
   *
   * Supports both `roles` (array) and `role` (string) claims.
   *
   * @param {object} payload
   * @returns {string[]}
   */
  getRoles(payload) {
    if (Array.isArray(payload.roles)) return payload.roles;
    if (typeof payload.role === 'string') return [payload.role];
    return [];
  }
}

module.exports = JwtAuthProvider;
