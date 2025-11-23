const mysql 	= require('mysql2/promise');
const Database 	= require('./Database');

class MySQLDatabase extends Database {
	/**
	 * 
	 * @param {object} config 
	 */
	constructor(config) {
		super(config);

		this.host	 	= config.host;
		this.user 		= config.user;
		this.password 	= config.password;
		this.database 	= config.database;
	}

	/**
	 * 
	 */
	async connect() {
		if (!this.host || !this.user || !this.password || !this.database) {
			throw new Error('Invalid database connection. Please provide connection parameters');
		}

		try {
			this.connection = await mysql.createConnection({
				host: 		this.host,
				user: 		this.user,
				password: 	this.password,
				database: 	this.database
			});
			
		} catch (err) {
			// err.code: 'ECONNREFUSED'
			console.error('Database Connection Error:', err, err.code);
			throw err;
		}
	}

	/**
	 * 
	 * @param {string} sql 
	 * @param {array} params 
	 * @returns {array} results from executing the query
	 */
	async query(sql, params) {
		if (!this.connection) {
			await this.connect();
		}

		// Sanitize parameters to check for injection attempts
        const sanitizedParams = this._sanitizeParams(params);

		this._logQuery(sql, sanitizedParams);

		const [result, fields] = await this.connection.query(sql, params);

		// return Array.isArray(result) ? result : [result];
		return result;
}

	/**
	 * 
	 * @param {string} sql 
	 * @param {array} params 
	 * @returns {ResultSetHeader} object containing affectedRows, fieldCount, insertId, changedRows, etc.
	 */
	async execute(sql, params) {
		const result = await this.query(sql, params);
		return result;
	}

	/**
	 * 
	 * @param {string} sql 
	 * @param {array} params 
	 * @returns {object|null}
	 */
	async fetchFirst(sql, params) {
		const result = await this.query(sql, params);
		return result?.length ? result[0] : null;
	}

	/**
	 * 
	 * @param {ResultSetHeader} result 
	 * @returns {int|null}
	 */
	getInsertId(result) {
		return result?.insertId || null;
	}

	/**
	 * 
	 * @param {ResultSetHeader} result 
	 * @returns {int|null}
	 */
	getAffectedRows(result) {
		return result?.affectedRows || 0;
	}

	/**
	 * 
	 * @param {ResultSetHeader} result 
	 * @returns {int|null}
	 */
	getChangedRows(result) {
		return result?.changedRows || 0;
	}
	
	/**
	 * 
	 */
	async close() {
		if (this.connection) await this.connection.end();
	}
}

module.exports = MySQLDatabase;