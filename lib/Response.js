/**
 * Response Class
 * 
 * Provides a clean interface for sending HTTP responses with proper
 * headers, status codes, and consistent JSON formatting.
 */
class Response {
	/**
	 * Constructor - initializes response with CORS headers
	 * 
	 * @param {http.ServerResponse} res - Node.js HTTP response object
	 */
	constructor(res) {
		this.res = res;
		this.statusCode = 200;
		this.headers = {
			'Content-Type': 'application/json'
		};
		this._setCorsHeaders();
	}

	/**
	 * Set CORS headers to allow cross-origin requests
	 * 
	 * @protected
	 */
	_setCorsHeaders() {
		//this.res.setHeader('Access-Control-Allow-Credentials', 'true');
		this.res.setHeader('Access-Control-Allow-Origin', '*');
		this.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		this.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	}

	/**
	 * Sets the http status code
	 * 
	 * @param {int} code 
	 * @returns {Response}
	 */
	status(code) {
		this.statusCode = code;
		return this;
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {string} value 
	 * @returns {Response}
	 */
	setHeader(name, value) {
		this.headers[name] = value;
		return this;
	}

	/**
	 * 
	 * @param {object} headers 
	 * @returns {Response}
	 */
	setHeaders(headers) {
		Object.assign(this.headers, headers);
		return this;
	}

	/**
	 * 
	 * @param {object} data 
	 */
	json(data) {
		this.setHeader('Content-Type', 'application/json');
		this.send(JSON.stringify(data));
	}

	/**
	 * 
	 * @param {*} data 
	 */
	text(data) {
		this.setHeader('Content-Type', 'text/plain');
		this.send(data);
	}

	/**
	 * 
	 * @param {*} data 
	 */
	html(data) {
		this.setHeader('Content-Type', 'text/html');
		this.send(data);
	}

	/**
	 * 
	 * @param {object} data 
	 */
	send(data) {
		this.res.writeHead(this.statusCode, this.headers);
		this.res.end(data);
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {string} value 
	 * @param {object} options 
	 * @returns {Response}
	 */
	cookie(name, value, options = {}) {
		const defaults = {
			path: '/',
			httpOnly: true
		};

		const opts = { ...defaults, ...options };

		let cookieStr = `${name}=${value}`;

		if (opts.maxAge && !opts.expires) {
			cookieStr += `; Max-Age=${opts.maxAge}`;
		}
		if (!opts.maxAge && opts.expires) {
			cookieStr += `; Expires=${opts.expires}`;
		}
		if (opts.path) {
			cookieStr += `; Path=${opts.path}`;
		}
		if (opts.httpOnly) {
			cookieStr += '; HttpOnly';
		}
		if (opts.secure) {
			cookieStr += '; Secure';
		}
		if (opts.sameSite) {
			cookieStr += `; SameSite=${opts.sameSite}`;
		}

		this.setHeader('Set-Cookie', cookieStr);
		return this;
	}

	/**
	 * 
	 * @param {string} name 
	 * @returns {Response}
	 */
	clearCookie(name) {
		return this.cookie(name, '', { expires: 'Thu, 01 Jan 1970 00:00:00 GMT' });
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {int} statusCode 
	 */
	redirect(url, statusCode = 302) {
		this.status(statusCode)
			.setHeader('Location', url)
			.send('');
	}

	/**
	 * 
	 * @param {object} data 
	 * @param {string} message 
	 * @returns {object}
	 */
	success(data, message = '') {
		return this.json({
			status: 200,
			success: true,
			message,
			data
		});
	}

	/**
	 * 
	 * @param {string} message 
	 * @param {int} statusCode 
	 * @param {object|null} details 
	 */
	error(message, statusCode = 400, details = null) {
		this.status(statusCode);
		const response = {
			status: statusCode,
			success: false,
			error: message
		};
		
		if (details) {
			response.details = details;
		}
		
		this.json(response);
	}

	/**
	 * 
	 * @param {array} errors 
	 */
	validationError(errors) {
		this.error('Validation failed', 422, errors);
	}

	/**
	 * 
	 * @param {string} message 
	 */
	unauthorized(message = 'Unauthorized') {
		this.error(message, 401);
	}

	/**
	 * 
	 * @param {string} message 
	 */
	forbidden(message = 'Forbidden') {
    	this.error(message, 403);
  	}

	/**
	 * 
	 * @param {string} message 
	 */
	notFound(message = 'Resource not found') {
		this.error(message, 404);
	}
}

module.exports = Response;