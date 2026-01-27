/**
 * Main Server File
 * 
 * This file initializes the HTTP server, sets up the database connection,
 * and routes incoming requests to the appropriate controllers.
 */

const http 				= require('http');
const url 				= require('url');
const Router 			= require('./lib/Router');
const Request 			= require('./lib/Request');
const Response 			= require('./lib/Response');
const Pipeline 			= require('./lib/Pipeline');
const ApiException 		= require('./exceptions/ApiException');
const { authenticate } 	= require('./middleware/AuthMiddleware');
const config 			= require('./conf/config');
const DatabaseFactory 	= require('./database/DatabaseFactory');

const PORT 				= process.env.PORT || 3000;
const API_PATH 			= process.env.API_PATH || '/api/v1';

class Server {
	constructor() {
		this.router = new Router();
		this.setupRoutes();
	}

	/**
	 * Setup all server routes
	 */
	setupRoutes() {
		// Session (User) Routes
		this.router.get(	`${API_PATH}/auth/session`, 	'UserController', 'session', [ authenticate ]);
		this.router.delete(	`${API_PATH}/auth/session`, 	'UserController', 'session', [ authenticate ]);

		// Auth (User) Routes
		this.router.post(	`${API_PATH}/auth/login`, 		'UserController', 'login');
		this.router.post(	`${API_PATH}/auth/logout`, 		'UserController', 'logout', [ authenticate ]);

		// User Routes
		this.router.post(	`${API_PATH}/user`, 			'UserController', 'create');
		this.router.get(	`${API_PATH}/user/:userId`, 	'UserController', 'read', [ authenticate ]);
		this.router.put(	`${API_PATH}/user/:userId`, 	'UserController', 'update', [ authenticate ]);
		this.router.delete(	`${API_PATH}/user/:userId`, 	'UserController', 'delete', [ authenticate ]);
		this.router.post(	`${API_PATH}/user/sendMail`, 	'UserController', 'sendMail');

		// Product Routes
		this.router.get(	`${API_PATH}/products/categories`, 		'ProductsController', 'readCategories');
		this.router.get(	`${API_PATH}/products/category/:name`, 	'ProductsController', 'readCategory');
		this.router.get(	`${API_PATH}/products`, 				'ProductsController', 'readAll');
		this.router.get(	`${API_PATH}/products/:id`, 			'ProductsController', 'read');
		this.router.put(	`${API_PATH}/products/:id`, 			'ProductsController', 'update', [ authenticate ]);
		this.router.delete(	`${API_PATH}/products/:id`, 			'ProductsController', 'delete', [ authenticate ]);

		// Order Routes
		this.router.get(	`${API_PATH}/orders/statuses`, 			'OrdersController', 'readStatuses', [ authenticate ]);
		this.router.get(	`${API_PATH}/orders/status/:name`, 		'OrdersController', 'readStatus', [ authenticate ]);
		this.router.get(	`${API_PATH}/orders`, 		 			'OrdersController', 'readAll', [ authenticate ]);
		this.router.get(	`${API_PATH}/orders/:id`, 				'OrdersController', 'read', [ authenticate ]);

		// Report Routes
		this.router.get(	`${API_PATH}/report/:reportId`, 		'ReportController', 'index', [ authenticate ]);
	}

	/**
	 * Parses the request to find the matching route and instantiate it
	 * 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async handleRequest(req, res) {
		const protocol 	= req.socket.encrypted ? 'https' : 'http';
		const parsedUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
		const pathname 	= parsedUrl.pathname;
		const method 	= req.method;

		const request 	= new Request(req);
		const response 	= new Response(res);

		try {
			// Find matching route
			const route = this.router.match(method, pathname);

			if (!route) {
				return response.error('Route not found', { path: pathname }, 404);
			}

			// Attach the database instance to the request object
			// This is a pooled connection
			request.db = DatabaseFactory.getInstance('mysql', config.DATABASE);

			// Define global middleware
			const globals = [
				async (rq, rs, next) => {
					// Parse the request body
					await rq.parseBody();

					await next();
				}
			];

			// Combine globals with route-specific middleware
			const middlewareChain = [ ...globals, ...(route.middleware || []) ];

			// Wrap the controller execution in a final handler
			// This gets executed after all middleware
			const finalAction = async () => {
				// Dynamically load the controller
				const ControllerClass 	= require(`./controllers/${route.controller}`);
				const controller 		= new ControllerClass(request, response);

				// Check if method exists
				if (typeof controller[route.action] !== 'function') {
					return response.error('Controller action not found', null, 500);
				}

				// Set route parameters
				request.setParams(route.params);

				// Execute controller action
				await controller[route.action]();
			}

			// Run the pipeline
			await Pipeline.run(request, response, middlewareChain, finalAction);

		} catch (error) {
			console.error('Server Error:', error);
			
			// Handle ApiException instances with proper status codes
			if (error instanceof ApiException) {
				response.error(error.message, null, error.code);

			} else {
				// Handle unexpected errors
				const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred. Please try again later.';
				response.error(errorMsg, null, error.code);
			}
		}
	}

	/**
	 * Start the server
	 */
	start() {
		const server = http.createServer(async (req, res) => {
			await this.handleRequest(req, res);
		});

		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
			console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
		});
	}
}

const app = new Server();
app.start();

module.exports = Server;