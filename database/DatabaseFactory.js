const MySQLDatabase = require('./MySQLDatabase');

class DatabaseFactory {
	/**
	 * 
	 * @param {string} type 
	 * @param {object} config 
	 * @returns {Database}
	 */
	static getInstance(type = 'mysql', config = {}) {
		switch(type.toLowerCase()) {
			case 'mysql':
				return new MySQLDatabase(config);
			default:
				return new MySQLDatabase(config);
		}
	}

	/**
	 * Get database instance from environment
	 * @returns {Database}
	 */
	static fromEnv() {
		const config = {
			host: 		process.env.DB_HOST 	|| 'locahost',
			port: 		process.env.DB_PORT 	|| 3306,
			user: 		process.env.DB_USER 	|| 'root',
			password: 	process.env.DB_PASSWORD || '',
			database: 	process.env.DB_NAME 	|| 'api_database' 
		};

		const type = process.env.DB_TYPE || 'mysql';
		return DatabaseFactory.getInstance(type, config);
	}
}

module.exports = DatabaseFactory;