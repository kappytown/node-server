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
const ApiException 		= require('./exceptions/ApiException');
// const config 			= require('./conf/config.json');
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
		this.router.get(	`${API_PATH}/auth/session`, 	'UserController', 'session');
		this.router.delete(	`${API_PATH}/auth/session`, 	'UserController', 'session');

		// Auth (User) Routes
		this.router.post(	`${API_PATH}/auth/login`, 		'UserController', 'login');
		this.router.post(	`${API_PATH}/auth/logout`, 		'UserController', 'logout');

		// User Routes
		this.router.post(	`${API_PATH}/user`, 			'UserController', 'create');
		this.router.get(	`${API_PATH}/user/:userId`, 	'UserController', 'read');
		this.router.put(	`${API_PATH}/user/:userId`, 	'UserController', 'update');
		this.router.delete(	`${API_PATH}/user/:userId`, 	'UserController', 'delete');
		this.router.post(	`${API_PATH}/user/sendMail`, 	'UserController', 'sendMail');

		// Product Routes
		this.router.get(	`${API_PATH}/products/categories`, 		'ProductsController', 'readCategories');
		this.router.get(	`${API_PATH}/products/category/:name`, 	'ProductsController', 'readCategory');
		this.router.get(	`${API_PATH}/products`, 				'ProductsController', 'readAll');
		this.router.get(	`${API_PATH}/products/:id`, 			'ProductsController', 'read');
		this.router.put(	`${API_PATH}/products/:id`, 			'ProductsController', 'update');
		this.router.delete(	`${API_PATH}/products/:id`, 			'ProductsController', 'delete');

		// Order Routes
		this.router.get(	`${API_PATH}/orders/statuses`, 			'OrdersController', 'readStatuses');
		this.router.get(	`${API_PATH}/orders/status/:name`, 		'OrdersController', 'readStatus');
		this.router.get(	`${API_PATH}/orders`, 		 			'OrdersController', 'readAll');
		this.router.get(	`${API_PATH}/orders/:id`, 				'OrdersController', 'read');

		// Report Routes
		this.router.get(	`${API_PATH}/report/:reportId`, 		'ReportController', 'index');
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
			// Parse the request body
			await request.parseBody();

			// Find matching route
			const route = this.router.match(method, pathname);

			if (!route) {
				response.status(404).json({
					error: 'Route not found',
					path: pathname
				});
				return;
			}

			// Get the database instance to pass to the controller class
			const db = DatabaseFactory.fromEnv();
			//const db = DatabaseFactory.getInstance('mysql', config.database); // if using config file

			// Dynamically load the controller
			const ControllerClass 	= require(`./controllers/${route.controller}`);
			const controller 		= new ControllerClass(db, request, response);

			// Check if method exists
			if (typeof controller[route.action] !== 'function') {
				response.status(500).json({ error: 'Controller action not found' });
				return;
			}

			// Set route parameters
			request.setParams(route.params);

			// Execute controller action
			await controller[route.action]();

		} catch (error) {
			console.error('Server Error:', error);
			
			// Handle ApiException instances with proper status codes
			if (error instanceof ApiException) {
				response.status(error.code).json({
					error: error.name,
					status: error.code || 500,
					message: process.env.NODE_ENV === 'development' ? error.message : undefined
				});

			} else {
				// Handle unexpected errors
				response.status(500).json({
					error: 'Internal Server Error',
					status: 500,
					message: process.env.NODE_ENV === 'development' ? error.message : undefined
				});
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