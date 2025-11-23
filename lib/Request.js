const url = require('url');
const querystring = require('querystring');
const InputSanitizer = require('./InputSanitizer');

/**
 * Request Class
 * 
 * Handles parsing and validation of incoming HTTP requests.
 * Provides convenient methods to access request data from various sources
 * (URL parameters, query strings, request body, headers).
 */
class Request {
	/**
	 * Constructor - initializes request parsing
	 * 
	 * @param {http.IncomingMessage} req - Node.js HTTP request object
	 */
	constructor(req) {
		// Note: new URL(req.url, 'http://dummy') will work just fine in dev and prod because pathname and query params do not depend on a valid url
		const protocol 		= req.socket.encrypted ? 'https' : 'http';
		const requestUrl 	= new URL(req.url, `${protocol}://${req.headers.host}`);

		this.req 		= req;												// The original Request object
		this.method 	= req.method;										// Request method
		this.url 		= req.url;											// Contains the entire url after the host and is not currently being used
		this.headers 	= req.headers;										// The request headers
		this.query 		= Object.fromEntries(requestUrl.searchParams)		// Will contain params from the querystring
		this.body 		= {}; 												// Will contain params posted in the request body
		this.params 	= {}; 												// Will contain all params inside enpoints such as userId
	}

	/**
	 * Internal method to parse JSON request body
	 * 
	 * @returns {Promise<void>}
	 */
	async parseBody() {
		return new Promise((resolve, reject) => {
			if (['GET', 'DELETE'].includes(this.method)) {
				resolve();
				return;
			}

			let body 			= '';
            let bodySize 		= 0;
			const maxBodySize 	= 1024 * 1024; // Limit body size to 1MB to prevent DOS attacks

			// Accumulate data chunks
			this.req.on('data', chunk => {
				body += chunk.toString();

				if (body.length > maxBodySize) {
					this.req.connection.destroy();
					reject(new Error('Request body too large'));
				}
			});

			// Parse complete body
			this.req.on('end', () => {
				try {
					const contentType = this.headers['content-type'] || '';

					if (contentType.includes('application/json')) {
						this.body = body ? JSON.parse(body) : {};

					} else if (contentType.includes('application/x-www-form-urlencoded')) {
						this.body = querystring.parse(body);

					} else {
						this.body = body;
					}
					
					resolve();

				} catch (e) {
					reject(error);
				}
			});

			this.req.on('error', reject);
		});
	}

	/**
	 * Sets the endpoint params ({ userId: 11 })
	 * 
	 * @param {object} params 
	 */
	setParams(params) {
		this.params = params || {};
	}

	/**
	 * 
	 * @param {string} key 
	 * @param {*} defaultValue 
	 * @param {string} source 
	 * @returns {*} sanitized value
	 */
	input(key, defaultValue = null, source = 'body') {
		let value;

		switch(source) {
			case 'query':
				value = this.query[key];
				break;
			case 'params':
				value = this.params[key];
				break;
			case 'body':
			default:
				value = this.body[key];
				break;
		}

		if (value === undefined || value === null) {
			return defaultValue;
		}

		return this.sanitize(value);
	}

	/**
	 * 
	 * @param {string} key - The key to look up in the query, params, and body objects
	 * @param {*} defaultValue - The default value to return if the specified key is not found
	 * @param {string} type - Type of sanitization to perform such as string, integer, etc.
	 * @param {object} options - Sanitization options
	 * @returns {*} The sanitized value
	 * 
	 * @example:
	 * 		this.request.getSanitizedParam('name');
	 * 		this.request.getSanitizedParam('email', null, 'email');
	 * 		this.request.getSanitizedParam('numItems', null, 'int', { min: 0, max: 10 });
	 */
	getSanitizedInput(key, defaultValue = null, type = 'string', options = {}) {
		const value = this.getValue(key, defaultValue);
		return InputSanitizer.sanitize(value, type, options);
	}

	/**
	 * Gets the value for the specified key from the query, params, or body objects
	 * 
	 * @param {string} key 
	 * @param {*} defaultValue 
	 * @returns {*} sanitized value
	 */
	getValue(key, defaultValue = null) {
		let value;

		if (this.query.hasOwnProperty(key)) {
			value = this.getQuery(key, defaultValue);
			
		} else if (this.params.hasOwnProperty(key)) {
			value = this.getParam(key, defaultValue);

		} else if (this.body.hasOwnProperty(key)) {
			value = this.getBody(key, defaultValue);
		}

		return value;
	}

	/**
	 * Gets the value for the specified key from the query object
	 * 
	 * @param {string} key 
	 * @param {*} defaultValue 
	 * @returns {*} sanitized value 
	 */
	getQuery(key, defaultValue = null) {
		return this.input(key, defaultValue, 'query');
	}

	/**
	 * Gets the value for the specified key from the body object
	 * 
	 * @param {string} key 
	 * @param {*} defaultValue 
	 * @returns {*} sanitized value 
	 */
	getBody(key, defaultValue = null) {
		return this.input(key, defaultValue, 'body');
	}

	/**
	 * Gets the value for the specified key from the params object
	 * 
	 * @param {string} key 
	 * @param {*} defaultValue 
	 * @returns {*} sanitized value 
	 */
	getParam(key, defaultValue = null) {
		return this.input(key, defaultValue, 'params');
	}

	/**
	 * Sanitizes the value
	 * 
	 * @param {*} value 
	 * @returns {*} sanitized value
	 */
	sanitize(value) {
		if (value === null || value === undefined) {
			return value;
		}

		// If array, sanitize each item
		if (Array.isArray(value)) {
			return value.map(item => this.sanitize(item));
		}

		// If object, sanitize each property
		if (typeof value === 'object') {
			const sanitized = {};
			for (const key in value) {
				sanitized[key] = this.sanitize(value[key]);
			}
			return sanitized;
		}

		// For string, escape dangerour characters
		if (typeof value === 'string') {
			return value
				.replace(/'/g, "''")  // Escape single quotes
				.replace(/\\/g, '\\\\')  // Escape backslashes
				.replace(/\0/g, '\\0')  // Escape null bytes
				.trim();
		}
		
		return value;
	}

	/**
	 * Gets the value for the specified key, sanitized it, then casts it to an int
	 * 
	 * @param {string} key 
	 * @param {int|null} defaultValue 
	 * @param {string} source 
	 * @returns {int}
	 */
	int(key, defaultValue = null, source = 'body') {
		const value = this.input(key, defaultValue, source);
		return InputSanitizer.sanitizeInteger(value, { default: defaultValue });
	}

	/**
	 * Gets the value for the specified key, sanitized it, then casts it to an float
	 * 
	 * @param {string} key 
	 * @param {float|null} defaultValue 
	 * @param {string} source 
	 * @returns {float}
	 */
	float(key, defaultValue = null, source = 'body') {
		const value = this.input(key, defaultValue, source);
		return InputSanitizer.sanitizeFloat(value, { default: defaultValue });
	}

	/**
	 * Gets the value for the specified key, sanitized it, then returns a boolean 
	 * 
	 * @param {string} key 
	 * @param {boolean|null} defaultValue 
	 * @param {string} source 
	 * @returns {boolean}
	 */
	boolean(key, defaultValue = false, source = 'body') {
		const value = this.input(key, defaultValue, source);
		return InputSanitizer.sanitizeBoolean(value, { default: defaultValue });
	}

	/**
	 * Gets all the key|value pairs from the source object
	 * 
	 * @param {string} source 
	 * @returns {object} key|value pairs
	 */
	all(source = 'body') {
		let data;

		switch (source) {
			case 'query':
				data = this.query;
				break;
			case 'params':
				data = this.params;
				break;
			case 'body':
			default:
				data = this.body;
				break;
		}

		return this.sanitize(data);
	}

	/**
	 * Checks if the source object has the specified key
	 * 
	 * @param {string} key 
	 * @param {string} source 
	 * @returns {boolean} true if source has the specified key
	 */
	has(key, source = 'body') {
		switch (source) {
			case 'query':
				return this.query.hasOwnProperty(key);
			case 'params':
				return this.params.hasOwnProperty(key);
			case 'body':
			default:
				return this.body.hasOwnProperty(key);
		}
	}

	/**
	 * Gets the header value for the specified key
	 * 
	 * @param {string} name 
	 * @returns {string}
	 */
	header(name) {
		return this.headers[name.toLowerCase()];
	}

	/**
	 * Gets the value of a specific cookie by key
	 * 
	 * @param {string} key 
	 * @returns {string|null}
	 */
	getCookie(key) {
		const cookies = this.getCookies();
		return cookies[key] || null;
	}

	/**
	 * Gets all the cookies and stores them in a readable name/value object
	 * 
	 * @returns {object}
	 */
	getCookies() {
		const cookies = {};
		const cookieHeader = this.req.headers.cookie;

		if (cookieHeader) {
			const cookiePairs = cookieHeader.split(';');

			cookiePairs.forEach(cookie => {
				const name 		= cookie.substring(0, cookie.indexOf('=')).trim();
				const value 	= cookie.substring(cookie.indexOf('=') + 1).trim();
				cookies[name] 	= decodeURIComponent(value);
			});
		}
		return cookies;
	}
}

module.exports = Request;