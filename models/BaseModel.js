/**
 * Base Model Class
 * 
 * Parent class for all API models.
 */
class BaseModel {
	/**
	 * Constructor - initializes controller with database instance
	 * 
	 * @param {mysql} db - MySQL instance
	 * @param {int} userId - ID of the authenticated user
	 */
	constructor(db, userId = 0) {
		this.db 	= db;
		this.userId = userId;
	}
}

module.exports = BaseModel;