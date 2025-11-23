/**
 * Base API Exception Class
 * 
 * Parent class for all custom API exceptions. Provides consistent error
 * formatting and the ability to attach additional context through variables.
 */
class ApiException extends Error {
	/**
	 * Constructor - creates a new API exception
	 * 
	 * @param {string|null} message - Error message (default: 'An error occurred')
	 * @param {object|null} vars - Key-value pairs to append to the message for context
	 * @param {number} code - HTTP status code (default: 500)
	 * @param {Error|null} previous - Original exception that caused this error
	 * 
	 * @example
	 * throw new ApiException(
	 *   'User not found',
	 *   { userId: 123, email: 'test@example.com' },
	 *   404
	 * );
	 */
	constructor(message = null, vars = null, code = 500, previous = null) {
		let finalMessage = message || 'An error occurred';

		// Append vars to message if provided for better context
		if (vars && typeof vars === 'object') {
			const varStrings = Object.entries(vars).map(([key, value]) => `${key}: ${value}`);
			finalMessage += ` (${varStrings.join(', ')})`;
		}

		super(finalMessage);

		// Set exception properties
		this.name 		= this.constructor.name;
		this.code 		= code;
		this.previous 	= previous;
		this.vars 		= vars;

		// Maintains proper stack trace for debugging
		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * Convert exception to JSON format for API responses
	 * 
	 * @returns {object} JSON representation of the exception
	 */
	toJSON() {
		return {
			//success: 	false,
			error: 		this.name,
			message: 	this.message,
			//code: 		this.code,
			...(this.vars && { details: this.vars })
		};
	}
}

module.exports = ApiException;