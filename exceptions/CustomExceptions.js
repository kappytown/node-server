const ApiException = require('./ApiException');

/**
 * Custom Exception Classes
 * 
 * All custom exceptions for the API, each with appropriate HTTP status codes
 * and default error messages.
 */

/**
 * Authentication Exception (401)
 * Thrown when authentication fails or credentials are invalid
 */
class AuthenticationException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (email, etc.)
	 */
	constructor(message = 'Invalid credentials', vars = null) {
		super(message, vars, 401);
	}
}

/**
 * Database Connection Exception (500)
 * Thrown when unable to connect to the database
 */
class DatabaseConnectionException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (typically lists missing params)
	 */
	constructor(message = 'Internal server error', vars = null) {
		super(message, vars, 500);
	}
}

/**
 * Database Query Exception (500)
 * Thrown when the database could not process the query
 */
class DatabaseQueryException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (typically lists missing params)
	 */
	constructor(message = 'Internal server error', vars = null) {
		super(message, vars, 500);
	}
}

/**
 * Maintenance Exception (503)
 * Thrown when the server is down due to maintenance
 */
class MaintenanceException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (method and endpoint)
	 */
	constructor(message = 'Server is down due to scheduled maintenance', vars = null) {
		super(message, vars, 503);
	}
}

/**
 * Method Not Allowed Exception (405)
 * Thrown when an HTTP verb is not supported for an endpoint
 */
class MethodNotAllowedException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (method and endpoint)
	 */
	constructor(message = 'HTTP method not allowed for this endpoint', vars = null) {
		super(message, vars, 405);
	}
}

/**
 * Method Not Found Exception (404)
 * Thrown when a requested controller method doesn't exist
 */
class MethodNotFoundException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context variables
	 */
	constructor(message = 'The requested method was not found', vars = null) {
		super(message, vars, 404);
	}
}

/**
 * Missing Parameters Exception (400)
 * Thrown when required request parameters are missing
 */
class MissingParametersException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (typically lists missing params)
	 */
	constructor(message = 'Required parameters are missing', vars = null) {
		super(message, vars, 400);
	}
}

/**
 * Not Found Exception (404)
 * Thrown when a requested resource doesn't exist
 */
class NotFoundException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (resource ID, type)
	 */
	constructor(message = 'Resource not found', vars = null) {
		super(message, vars, 404);
	}
}

/**
 * Payment API Exception (500)
 * Thrown when the payment api failed to process the request
 */
class PaymentApiException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Additional context (resource ID, type)
	 */
	constructor(message = 'Internal server error', vars = null) {
		super(message, vars, 500);
	}
}

/**
 * Validation Exception (422)
 * Thrown when request data fails validation rules
 */
class ValidationException extends ApiException {
	/**
	 * @param {string} message - Error message
	 * @param {object|null} vars - Validation errors details
	 */
	constructor(message = 'Validation failed', vars = null) {
		super(message, vars, 422);
	}
}

// Export all exception classes
module.exports = {
	ApiException,
	AuthenticationException,
	DatabaseConnectionException,
	DatabaseQueryException,
	MaintenanceException,
	MethodNotAllowedException,
	MethodNotFoundException,
	MissingParametersException,
	NotFoundException,
	PaymentApiException,
	ValidationException
};