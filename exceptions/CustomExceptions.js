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
     * @param {Error|null} previous - Original exception
     */
    constructor(message = 'Authentication failed', vars = null, previous = null) {
        super(message, vars, 401, previous);
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
     * @param {Error|null} previous - Original exception
     */
    constructor(message = 'HTTP method not allowed for this endpoint', vars = null, previous = null) {
        super(message, vars, 405, previous);
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
     * @param {Error|null} previous - Original exception
     */
    constructor(message = 'The requested method was not found', vars = null, previous = null) {
        super(message, vars, 404, previous);
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
     * @param {Error|null} previous - Original exception
     */
    constructor(message = 'Required parameters are missing', vars = null, previous = null) {
        super(message, vars, 400, previous);
    }
}

/**
 * Not Found Exception (404)
 * Thrown when a requested resource doesn't exist in the database
 */
class NotFoundException extends ApiException {
    /**
     * @param {string} message - Error message
     * @param {object|null} vars - Additional context (resource ID, type)
     * @param {Error|null} previous - Original exception
     */
    constructor(message = 'Resource not found', vars = null, previous = null) {
        super(message, vars, 404, previous);
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
     * @param {Error|null} previous - Original exception
     */
    constructor(message = 'Validation failed', vars = null, previous = null) {
        super(message, vars, 422, previous);
    }
}

// Export all exception classes
module.exports = {
    ApiException,
    AuthenticationException,
    MethodNotAllowedException,
    MethodNotFoundException,
    MissingParametersException,
    NotFoundException,
    ValidationException
};