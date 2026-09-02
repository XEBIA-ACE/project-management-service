'use strict';

/**
 * AuthProvider — outbound port (interface).
 *
 * Adapters that integrate with an external auth/identity provider
 * must implement these methods.
 */
class AuthProvider {
  /**
   * Verify a raw JWT string and return the decoded payload.
   *
   * @param {string} token
   * @returns {Promise<object>} decoded JWT payload
   * @throws {Error} if the token is invalid or expired
   */
  // eslint-disable-next-line no-unused-vars
  async verifyToken(token) {
    throw new Error('AuthProvider.verifyToken() not implemented');
  }

  /**
   * Extract roles from a decoded JWT payload.
   *
   * @param {object} payload
   * @returns {string[]}
   */
  // eslint-disable-next-line no-unused-vars
  getRoles(payload) {
    throw new Error('AuthProvider.getRoles() not implemented');
  }
}

module.exports = AuthProvider;
