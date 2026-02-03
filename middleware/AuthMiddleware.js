const AuthModel 		= require('#models/AuthModel');
const SessionService 	= require('#services/SessionService');
const { AuthenticationException } = require('#exceptions/CustomExceptions');

/**
 * Middleware to handle user authentication via session cookies.
 * 
 * @param {Request} req - The custom Request object
 * @param {Response} res - The custom Response object
 * @param {Function} next - The next function in the pipeline
 */
async function authenticate(req, res, next) {
	// 1. Authenticate the user's session
	const token = req.getCookie(SessionService.getCookieName()) || '';

	// Basic format validation
	if (!token || SessionService.hasInvalidCharacters(token)) {
		throw new AuthenticationException('Invalid or missing authentication token');
	}

	// 2. Database validation using the injected DB
	const authModel = new AuthModel(req.db);
	const session = await authModel.authenticate(token);

	if (!session) {
		throw new AuthenticationException('Session not found.');
	}

	// 3. Set the userId on the request object for the controller to use
	req.userId = session.user_id;
	req.token = token;

	await next();
}

module.exports = { authenticate };