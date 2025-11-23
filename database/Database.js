const InputSanitizer = require('../lib/InputSanitizer');

class Database {
	constructor(config) {
		this.config = config;
	}
	async connect() {
		throw new Error('connect must be implemented');
	}
	async close() {
		throw new Error('close must be implemented');
	}
	async query(sql, args=[]) {
		throw new Error('query must be implemented');
	}
	async execute(sql, args=[]) {
		throw new Error('execute must be implemented');
	}
	async fetchFirst(sql, args=[]) {
		throw new Error('fetchFirst must be implemented');
	}
	getInsertId(result) {
		throw new Error('getInsertId must be implemented');
	}
	getAffectedRows(result) {
		throw new Error('getAffectedRows must be implemented');
	}
	getChangedRows(result) {
		throw new Error('getChangedRows must be implemented');
	}

	/**
     * Helper: Sanitize parameter values before binding
     * Provides an additional layer of protection
     * 
     * @param {Array} params - Parameter values
     * @returns {Array} Sanitized parameter values
     * @protected
     */
    _sanitizeParams(params) {
        return params.map(param => {
            // Check for SQL injection attempts in string parameters
            if (typeof param === 'string') {
                if (InputSanitizer.detectSqlInjection(param)) {
                    throw new Error('Potential SQL injection detected in parameter value');
                }
            }
            return param;
        });
    }

	/**
     * Helper: Log query for debugging (if enabled in config)
     * Sanitizes sensitive data in logs
     * 
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @protected
     */
    _logQuery(sql, params) {
        if (this.config.debug) {
            console.log('[DB Query]', sql);
            if (params && params.length > 0) {
                // Mask sensitive data in logs
                const sanitizedParams = params.map(param => {
                    if (typeof param === 'string' && param.length > 50) {
                        return param.substring(0, 50) + '... (truncated)';
                    }
                    return param;
                });
                console.log('[DB Params]', sanitizedParams);
            }
        }
    }
}

module.exports = Database;