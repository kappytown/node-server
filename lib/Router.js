/**
 * Router Class
 * Handles route registration and matching
 */
class Router {
	constructor() {
		this.routes = {
			GET: 	[],
			POST: 	[],
			PUT: 	[],
			DELETE: [],
			PATCH: 	[]
		};
	}

	/**
	 * Registers a GET route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @param {array} middleware
	 */
	get(path, controller, action, middleware = []) {
		this._addRoute('GET', path, controller, action, middleware);
	}

	/**
	 * Registers a POST route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @param {array} middleware
	 */
	post(path, controller, action, middleware = []) {
		this._addRoute('POST', path, controller, action, middleware);
	}

	/**
	 * Registers a PUT route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @param {array} middleware
	 */
	put(path, controller, action, middleware = []) {
		this._addRoute('PUT', path, controller, action, middleware);
	}

	/**
	 * Registers a DELETE route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @param {array} middleware
	 */
	delete(path, controller, action, middleware = []) {
		this._addRoute('DELETE', path, controller, action, middleware);
	}

	/**
	 * Registers a PATCH route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @param {array} middleware
	 */
	patch(path, controller, action, middleware = []) {
		this._addRoute('PATCH', path, controller, action, middleware);
	}

	/**
	 * Adds a route to the routes array
	 * 
	 * @param {string} method 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @param {array} middleware
	 * @protected
	 */
	_addRoute(method, path, controller, action, middleware = []) {
		const pattern 	= this._pathToRegex(path);
		const keys 		= this._extractParamKeys(path);

		// Ensure middleware is always an array
		const middlewareArray = Array.isArray(middleware) ? middleware : [ middleware ];

		this.routes[method].push({ 
			path, 
			pattern, 
			keys, 
			controller, 
			action, 
			middleware: middlewareArray
		});
	}

	/**
	 * Converts the path pattern to a RegExp
	 * /users/:userId => /^\/([^\/]+)$/
	 * 
	 * @param {string} path 
	 * @returns {RegExp}
	 * @protected
	 */
	_pathToRegex(path) {
		const regexPath = path
			.replace(/\//g, '\\/')
			.replace(/:(\w+)/g, '([^\\/]+)');

		return new RegExp(`^${regexPath}$`);
	}

	/**
	 * Extracts parameter keys from the path
	 * /users/:userId/orders/:orderId => ['userId', 'orderId']
	 * 
	 * @param {string} path 
	 * @returns {array}
	 * @protected
	 */
	_extractParamKeys(path){
		const keys = [];
		const matches = path.matchAll(/:(\w+)/g);
		
		for(const match of matches) {
			keys.push(match[1]);
		}

		return keys;
	}

	/**
	 * Matches the request pathname to a route
	 * 
	 * @param {string} method 
	 * @param {string} pathname 
	 * @returns {object|null}
	 */
	match(method, pathname) {
		const routes = this.routes[method] || [];

		for (const route of routes) {
			const match = pathname.match(route.pattern);

			if (match) {
				const params = {};

				for (let i=0; i<route.keys.length; i++) {
					params[route.keys[i]] = match[i + 1];
				}

				return {
					controller: route.controller,
					action: 	route.action,
					middleware: route.middleware, 
					params
				};
			}
		}

		return null;
	}
}

module.exports = Router;