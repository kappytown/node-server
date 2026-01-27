const mysql 	= require('mysql2/promise');
const Database 	= require('./Database');
const { DatabaseConnectionException } = require('../exceptions/CustomExceptions');

class MySQLDatabase extends Database {
	pool 		= null;
	lastQuery 	= null;

	/**
	 * 
	 * @param {object} config
	 */
	constructor(config) {
		super(config);

		this.host	 	= config.HOST;
		this.user 		= config.USER;
		this.password 	= config.PASSWORD;
		this.database 	= config.DATABASE;
	}

	/**
	 * 
	 */
	async connect() {
		if (this.pool) return;

		if (!this.host || !this.user || !this.password || !this.database) {
			throw (new DatabaseConnectionException('Connection refused')).setLogMessage('Invalid database connection. Please provide connection parameters');
		}

		try {
			this.pool = await mysql.createPool({
				host: 				this.host,
				user: 				this.user,
				password: 			this.password,
				database: 			this.database,
				waitForConnections: true,
				connectionLimit: 	10,
				queueLimit: 		0
			});
			
		} catch (err) {
			throw (new DatabaseConnectionException('Connection refused')).setLogMessage(err.stack);
		}
	}

	/**
	 * Returns the connection object required for transactions
	 * 
	 * @returns {Connection}
	 */
	async getConnection() {
		if (!this.pool) {
			await this.connect();
		}
		return await this.pool.getConnection();
	}

	/**
	 * 
	 * @param {string} sql 
	 * @param {array} params 
	 * @returns {array} results from executing the query
	 */
	async query(sql, params) {
		if (!this.pool) {
			await this.connect();
		}

		// Sanitize parameters to check for injection attempts
        const sanitizedParams = this._sanitizeParams(params);

		this._logQuery(sql, sanitizedParams);

		const [result, fields] = await this.pool.query(sql, sanitizedParams);
		
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
		if (this.pool) await this.pool.end();
	}
}

module.exports = MySQLDatabase;