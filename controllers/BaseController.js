/**
 * Base Controller Class
 * 
 * Parent class for all API controllers.
 */
class BaseController {
	/**
	 * Constructor - initializes controller with database, request and response instances
	 * 
	 * @param {Request} request
	 * @param {Reponse} response
	 */
	constructor(request, response) {
		this.db 		= request.db;
		this.request 	= request;
		this.response 	= response;
	}
}

module.exports = BaseController;