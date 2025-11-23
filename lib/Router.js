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
	 */
	get(path, controller, action) {
		this._addRoute('GET', path, controller, action);
	}

	/**
	 * Registers a POST route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 */
	post(path, controller, action) {
		this._addRoute('POST', path, controller, action);
	}

	/**
	 * Registers a PUT route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 */
	put(path, controller, action) {
		this._addRoute('PUT', path, controller, action);
	}

	/**
	 * Registers a DELETE route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 */
	delete(path, controller, action) {
		this._addRoute('DELETE', path, controller, action);
	}

	/**
	 * Registers a PATCH route
	 * 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 */
	patch(path, controller, action) {
		this._addRoute('PATCH', path, controller, action);
	}

	/**
	 * Adds a route to the routes array
	 * 
	 * @param {string} method 
	 * @param {string} path 
	 * @param {string} controller 
	 * @param {string} action 
	 * @protected
	 */
	_addRoute(method, path, controller, action) {
		const pattern 	= this._pathToRegex(path);
		const keys 		= this._extractParamKeys(path);

		this.routes[method].push({ path, pattern, keys, controller, action });
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
					action: route.action,
					params
				};
			}
		}

		return null;
	}
}

module.exports = Router;