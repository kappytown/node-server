const crypto 						= require('crypto');
const BaseController 				= require('./BaseController');
const { AuthenticationException } 	= require('../exceptions/CustomExceptions');
const AuthModel 					= require('../models/AuthModel');

/**
 * Auth Controller
 * 
 * Handles Authentication by validating the user token
 */
class AuthController extends BaseController {
	/**
	 * 
	 * @param {mysql instance} db - MySQL instance 
	 * @param {Request} request - Request object
     * @param {Response} response - Response helper object
	 */
    constructor(db, request, response)  {
		super(db, request, response);

		this.userId 			= 0;								// The logged in user's id
		this.token 				= this._getToken();					// The logged in user's token which is used to authenticate the user
		this.cookieName 		= 'simple_app_cookie';				// The name of the session cookie
		this.sessionTimeout 	= 1000 * 60 * 60 * 24 * 14;			// The duration of the session
		this.authModel 			= new AuthModel(this.db);			// The model that handles database authentication calls
	}

	/**
	 * Gets the associated userId for the token stored in a cookie.
	 * 
	 * @returns {object}
	 * @throws {AuthenticationException} if validation fails
	 */
	async authenticate() {
		this.token = this._getToken();
			
		// Validate the token
		if (!this.token || !/^[0-9a-zA-Z-_=|:]*$/.test(this.token)) {
			throw new AuthenticationException('Invalid or missing authentication token');

		} else {
			// Get the associated userId for the token
			const result = await this.authModel.authenticate(this.token);
			
			if (!result) {
				throw new AuthenticationException('Session not found.');
			}

			this._setUserAndToken(result['user_id'], this.token);
			return result;
		}
	}

	/**
	 * Creates the user session and cookie
	 * 
	 * @param {int} userId 
	 * @returns {object}
	 * @throws {AuthenticationException} if validation fails
	 */
	async createSession(userId) {
		this.token = this._generateToken();
		
		const expiresAt = this._getSessionExpiration();
		const result 	= await this.authModel.createSession(userId, this.token, expiresAt, this.token, expiresAt);

		if (result) {
			this._setUserAndToken(userId, this.token);

			this.response.cookie(this.cookieName, this.token, { maxAge: this.sessionTimeout, secure: true, sameSite: 'Lax' }); // 2 weeks
			return { token: this.token, userId: this.userId };
		
		} else {
			throw new AuthenticationException('Unable to create user session.');
		}
	}

	/**
	 *  Deletes the user session and cookie
	 */
	async deleteSession() {
		// delete from the db
		await this.authModel.deleteSession(this.token);

		// remove the cookie
		this.response.clearCookie(this.cookieName);

		// Reset vars
		this._setUserAndToken();
	}

	/**
	 * Checks if the user is already authenticated
	 * 
	 * @returns {boolean} true if both token and userId are set
	 */
	async isAuthenticated() {
		return this.token !== null && this.userId !== 0;
	}

	/**
	 * Deletes the session cookie
	 */
	deleteCookie() {
		this.response.clearCookie(this.cookieName);
	}

	/**
	 * Sets the class veriables userId and token
	 * 
	 * @param {int} userId 
	 * @param {token} token 
	 * @protected
	 */
	_setUserAndToken(userId = 0, token = null) {
		this.userId = userId;
		this.token 	= token;
	}

	/**
	 * 
	 * @returns {string} the cookie value
	 * @protected
	 */
	_getToken() {
		return this.request.getCookie(this.cookieName) || '';
	}

	/**
	 * 
	 * @returns {string} the session expiration date
	 * @protected
	 */
	_getSessionExpiration() {
		return new Date(Date.now + this.sessionTimout);
	}

	/**
	 * 
	 * @returns {string} the generated session token
	 * @protected
	 */
	_generateToken() {
		const randomBytes = crypto.randomBytes(64).toString('base64');
		//const randomBytes = crypto.randomBytes(32).toString('hex');
		
		return randomBytes
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/\\/g, '|')
			.replace(/ /g, ':');
	}
}

module.exports = AuthController;