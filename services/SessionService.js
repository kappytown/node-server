const crypto = require('crypto');

/**
 * Service to handle session generation and security logic.
 */
class SessionService {
	// The name of the session cookie
	static COOKIE_NAME = 'simple_app_cookie';
	static CSRF_COOKI_NAME = 'csrf_token';


	// 14 days in seconds
	static SESSION_LIFESPAN = 60 * 60 * 24 * 14;

	/**
	 * Returns the name of the session cookie
	 * 
	 * @returns {string}
	 */
	static getCookieName() {
		return this.COOKIE_NAME;
	}

	/**
	 * Returns the name of the CSRF cookie
	 * 
	 * @returns {string}
	 */
	static getCsrfCookieName() {
		return this.CSRF_COOKI_NAME;
	}

	/**
	 * Generates a secure random token.
	 * 
	 * @returns {string}
	 */
	static generateToken() {
		return crypto.randomBytes(64).toString('base64')
			.replace(/\+/g, '-').replace(/\//g, '_')
			.replace(/\\/g, '|').replace(/ /g, ':');
	}

	/**
	 * Validates the tokens chacacters
	 * 
	 * @param {string} token 
	 * @returns {boolean}
	 */
	static hasInvalidCharacters(token) {
		return !/^[0-9a-zA-Z-_=|:]*$/.test(token);
	}

	/**
	 * Calculates expiration (14 days).
	 * 
	 * @returns {Date}
	 */
	static getExpiration() {
		return new Date(Date.now() + (this.SESSION_LIFESPAN * 1000));
	}

	/**
	 * Returns the lifespan in seconds for the cookie
	 * 
	 * @returns {int}
	 */
	static getCookieMaxAge() {
		return this.SESSION_LIFESPAN;
	}
}


module.exports = SessionService;