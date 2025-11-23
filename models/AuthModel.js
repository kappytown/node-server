const BaseModel = require('./BaseModel');

/**
 * Auth Model Class
 */
class AuthModel extends BaseModel {
	constructor(db) {
		super(db);
	}

	/**
	 * Returns the users session if found
	 * 
	 * @param {string} token 
	 * @returns {object|null}
	 */
	async authenticate(token) {
		const result = await this.db.query('SELECT user_id FROM sessions WHERE token = ? LIMIT 1', [ token ]);

		if (result?.length > 0) {
			return result[0];
		}

		return null;
	}

	/**
	 * Inserts the token in the sessions table for the logged in user
	 * 
	 * @param {int} userId 
	 * @param {string} token 
	 * @param {string} expiresAt
	 * @returns {bool}
	 */
	async createSession(userId, token, expiresAt) {
		const result = await this.db.execute('INSERT IGNORE INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?', [ userId, token, expiresAt, token, expiresAt ]);

		return result?.affectedRows > 0;
	}

	/**
	 * Deletes the associated session in the sessions table
	 * 
	 * @param {string} token 
	 * @returns {bool}
	 */
	async deleteSession(token) {
		const result = await this.db.execute('DELETE FROM sessions WHERE token = ?', [ token ]);

		return result?.affectedRows > 0;
	}
}

module.exports = AuthModel;