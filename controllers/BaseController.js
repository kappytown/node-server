/**
 * Base Controller Class
 * 
 * Parent class for all API controllers.
 */
class BaseController {
	/**
	 * Constructor - initializes controller with database, request and response instances
	 * 
	 * @param {mysql instance} db - MySQL instance
	 * @param {Request} request
	 * @param {Reponse} response
	 */
	constructor(db, request, response) {
		this.db 		= db;
		this.request 	= request;
		this.response 	= response;
	}
}

module.exports = BaseController;